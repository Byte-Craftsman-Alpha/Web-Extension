function filterByValue(records, filter) {
    return records.filter((record) => {
        return Object.keys(filter).every((key) => {
            return record.hasOwnProperty(key) && String(record[key]).includes(filter[String(key)]);
        });
    });
}

class IndexedDBManager {
    constructor(database_name, table_name) {
        this.database_name = database_name;
        this.table_name = table_name;
    }

    async openDatabase() {
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open(this.database_name, 1);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const objStore = db.createObjectStore(this.table_name, { autoIncrement: true });
                this.database = db;
            };

            request.onsuccess = (event) => {
                resolve(event.target.result);
            };

            request.onerror = (event) => {
                console.error(event.target.error);
                reject(event.target.error);
            };
        });
    }

    async addRecord(...records) {
        const db = await this.openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.table_name, "readwrite");
            const objectStore = transaction.objectStore(this.table_name);
            records.forEach(record => {
                const request = objectStore.add(record);

                request.onerror = (event) => {
                    console.log("Error: " + event.target.errorCode);
                    reject(event.target.errorCode);
                };

                request.onsuccess = (event) => {
                    console.log('%cYour record added successfully into database.', 'color: blue;');
                    console.log(record);
                    resolve(event.target.result);
                };

            });

            transaction.oncomplete = () => {
                console.log('%cTransaction Complete', 'color: green;');
            };
        });
    }

    async fetchRecords() {
        const db = await this.openDatabase();
        const transaction = db.transaction(this.table_name, "readonly");
        const objectStore = transaction.objectStore(this.table_name);
        const request = objectStore.getAll();
        let response;

        request.onsuccess = (event) => {
            response = event.target.result;
            console.log('%cRecord found.', 'color: blue;');
            //console.log(event.target.result);
        };

        request.onerror = (event) => {
            console.error(event.target.error);
            response = 'Error in fetching data';
        };

        transaction.oncomplete = () => {
            console.log('%cTransaction Complete', 'color: green;');
        };

        return response;

    }

    async filterRecords(condition) {
        const db = await this.openDatabase();
        const transaction = db.transaction(this.table_name, "readonly");
        const objectStore = transaction.objectStore(this.table_name);
        const request = objectStore.getAll();

        return new Promise((resolve, reject) => {
            request.onsuccess = (event) => {
                const response = event.target.result;
                console.log('%cSearching...', 'color: red;');
                const result = filterByValue(response, condition);
                resolve(result);
            };

            request.onerror = (event) => {
                console.error(event.target.error);
                reject('Error in fetching data');
            };

            transaction.oncomplete = () => {
                console.log('%cTransaction Complete', 'color: green;');
            };
        });
    }

    async update(condition, updates) {
        const db = await this.openDatabase();
        const transaction = db.transaction(this.table_name, "readwrite");
        const objectStore = transaction.objectStore(this.table_name);

        return new Promise((resolve, reject) => {
            const request = objectStore.getAll();
            request.onsuccess = (event) => {
                const records = event.target.result;
                const matchedRecords = filterByValue(records, condition);

                if (matchedRecords.length === 0) {
                    reject(`No records found matching the condition: ${JSON.stringify(condition)}`);
                } else {
                    matchedRecords.forEach((record) => {
                        Object.assign(record, updates);
                        const requestUpdate = objectStore.put(record);
                        requestUpdate.onerror = (event) => {
                            console.error(event.target.error);
                            reject(event.target.error);
                        };
                        requestUpdate.onsuccess = (event) => {
                            console.log(`Record updated successfully: ${JSON.stringify(record)}`);
                        };
                    });
                    resolve(`Updated ${matchedRecords.length} records successfully`);
                }
            };

            request.onerror = (event) => {
                console.error(event.target.error);
                reject(event.target.error);
            };

            transaction.oncomplete = () => {
                console.log('%cTransaction Complete', 'color: green;');
            };
        });
    }

    async delete(condition) {
        const db = await this.openDatabase();
        const transaction = db.transaction(this.table_name, "readwrite");
        const objectStore = transaction.objectStore(this.table_name);

        return new Promise((resolve, reject) => {
            const request = objectStore.getAll();
            request.onsuccess = (event) => {
                const records = event.target.result;
                const matchedRecords = filterByValue(records, condition);

                if (matchedRecords.length === 0) {
                    reject(`No records found matching the condition: ${JSON.stringify(condition)}`);
                } else {
                    matchedRecords.forEach((record) => {
                        const requestDelete = objectStore.delete(record.id);
                        requestDelete.onerror = (event) => {
                            console.error(event.target.error);
                            reject(event.target.error);
                        };
                        requestDelete.onsuccess = (event) => {
                            console.log(`Record deleted successfully: ${JSON.stringify(record)}`);
                        };
                    });
                    resolve(`Deleted ${matchedRecords.length} records successfully`);
                }
            };

            request.onerror = (event) => {
                console.error(event.target.error);
                reject(event.target.error);
            };

            transaction.oncomplete = () => {
                console.log('%cTransaction Complete', 'color: green;');
            };
        });
    }
}

// initialise database
var database = new IndexedDBManager('New Database', 'Table 01');

// add record
//database.addRecord({ name: "Mohan", age: 77 }, { name: "Sohan", age: 67 });

// fetch records
//database.fetchRecords();

// filter records
//const filteredData = await database.filterRecords({ age: '7' });
//console.log(filteredData);

// update records
//const condition = { name: "John", age: 23 };
//const updates = { occupation: "Software Engineer", address: "123 Main St" };
//database.update(condition, updates).then((result) => {
//  console.log(result);
//}).catch((error) => {
//  console.error(error);
//});

// delete records
//const condition = { name: "John", age: 23 };
//database.delete(condition).then((result) => {
//  console.log(result);
//}).catch((error) => {
//  console.error(error);
//});