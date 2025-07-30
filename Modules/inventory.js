class Inventory {
    constructor(data) {
        this.item_id = data.item_id;
        this.material_name = data.material_name;
        this.stock_quantity = data.stock_quantity;
        this.price = data.price;
        this.supplier = data.supplier;
        this.expiry_date = data.expiry_date;
    }

    

    toJSON() {
        return {
            item_id: this.item_id,
            material_name: this.material_name,
            stock_quantity: this.stock_quantity,
            price: this.price,
            supplier: this.supplier,
            expiry_date: this.expiry_date
        };
    }
}

module.exports = Inventory;