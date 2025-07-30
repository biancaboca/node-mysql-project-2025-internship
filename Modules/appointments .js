class Appointments {
    constructor(data) {
        this.appointment_id = data.appointment_id;
        this.client_id = data.client_id;
        this.employee_id = data.employee_id;
        this.date = data.date;
        this.time = data.time;
        this.price = data.price;
        this.description = data.description;
        this.status = data.status || 'scheduled'; // scheduled, completed, cancelled
    }

  

    toJSON() {
        return {
            appointment_id: this.appointment_id,
            client_id: this.client_id,
            employee_id: this.employee_id,
            date: this.date,
            time: this.time,
            price: this.price,
            description: this.description,
            status: this.status
        };
    }
}

module.exports = Appointments;