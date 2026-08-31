# record-state-before-anything-reads-it

Reconcile `pulse` and `loop` with three lifecycle fixes that already shipped: a run commits its state whether or not it publishes, a job's ledger line is written before the queue is recomputed from it, and a merged job retires the proposal it was selected from
