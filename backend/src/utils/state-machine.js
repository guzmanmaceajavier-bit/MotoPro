function createStateMachine(transitions) {
  const validStates = new Set(Object.keys(transitions));
  for (const [from, toList] of Object.entries(transitions)) {
    toList.forEach(s => validStates.add(s));
  }

  return {
    validStates: [...validStates],
    canTransition(from, to) {
      return transitions[from]?.includes(to) ?? false;
    },
    transition(from, to) {
      if (!this.canTransition(from, to)) {
        throw new Error(`Transición inválida: ${from} → ${to}`);
      }
      return to;
    },
    getAllowedTransitions(from) {
      return transitions[from] || [];
    },
  };
}

const WORK_ORDER_TRANSITIONS = createStateMachine({
  pending: ["in_diagnostic", "cancelled"],
  in_diagnostic: ["waiting_approval", "cancelled"],
  waiting_approval: ["in_progress", "cancelled"],
  in_progress: ["in_qc", "waiting_parts"],
  waiting_parts: ["in_progress", "cancelled"],
  in_qc: ["completed", "in_progress"],
  completed: ["delivered", "invoiced"],
  delivered: ["invoiced"],
  invoiced: ["paid"],
  cancelled: [],
  paid: [],
});

const QUOTE_TRANSITIONS = createStateMachine({
  draft: ["sent", "cancelled"],
  sent: ["approved", "rejected", "expired"],
  approved: ["converted"],
  rejected: ["draft"],
  expired: [],
  converted: [],
  cancelled: [],
});

const INVOICE_TRANSITIONS = createStateMachine({
  draft: ["issued", "cancelled"],
  issued: ["paid", "overdue", "cancelled"],
  paid: [],
  overdue: ["paid", "cancelled"],
  cancelled: [],
});

const APPOINTMENT_TRANSITIONS = createStateMachine({
  scheduled: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
});

module.exports = {
  createStateMachine,
  WORK_ORDER_TRANSITIONS,
  QUOTE_TRANSITIONS,
  INVOICE_TRANSITIONS,
  APPOINTMENT_TRANSITIONS,
};
