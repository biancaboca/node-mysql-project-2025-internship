class Invoices {
    constructor(data) {
        this.invoice_id = data.invoice_id;
        this.client_id = data.client_id;
        this.amount = data.amount;
        this.date = data.date || new Date().toISOString().split('T')[0];
        this.status = data.status || 'pending'; // pending, paid, overdue
        this.deadline = data.deadline;
        this.items = data.items || [];
    }

  

    toJSON() {
        return {
            invoice_id: this.invoice_id,
            client_id: this.client_id,
            amount: this.amount,
            date: this.date,
            status: this.status,
            deadline: this.deadline,
            items: this.items
        };
    }
}

module.exports = Invoices;