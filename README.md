# Web-Extension
- A directory that I need to use in future for development of my personal web extensions.
- This extension can be used to take screenshot of particular web element withing the document and send it to telegram.
- Using this one can send text messages to telegram also.
- It can store data into indexed db of the browser.
- It can be used to manage notifications and Pop Up from the page.

### Manage Notifications
```javascript
const notificationManager = new NotificationManager();

// Push Notification
notificationManager.pushNotification('Notification title', 'Notification body content', 'notification icon');
```

### Manage Telegram bot
```javascript
const telegramBot = new telegram_bot('BOT_TOKEN');

// Send screenshot of element
capture_snapshot(ELEMENT_NODE).then(base64data => {
    var blob_object = base64ToBlob(base64data);
    telegramBot.send_photo(CHAT_ID, blob_object, 'IMAGE_CAPTION');
});

// Send text message
telegramBot.send_message(CHAT_ID, 'MESSAGE')
```

### Manage Pop Up
```javascript
var pop_up = new PopUp('POP_UP_WINDOW_TITLE', WIDTH, HEIGHT);

// Open window
pop_up.open();

// Write into pop up
pop_up.write(HTML_CODE);

// Replace pop up body
pop_up.over_write(HTML_CODE);
```

### Manage Indexed DB Database 
```javascript
// Database
var database = new IndexedDBManager('New Database', 'Table 01');

// add record
database.addRecord({ name: "Mohan", age: 77 });

// Add Multiple Records
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

// Fetch Complete Data 
var records = await database.fetchRecords();// fetch reocrd

// Fetch data with conditions
const filteredData = await database.filterRecords({ age: '7' });

// Update Data
database.update({ name: "John", age: 23 }, { occupation: "Software Engineer", address: "123 Main St" }).then((result) => { // update record
    console.log(result);
}).catch((error) => {
    console.error(error);
});

// Delete Data
database.delete({ name: "John", age: 23 }).then((result) => { // delete records
    console.log(result);
}).catch((error) => {
    console.error(error);
});
```
