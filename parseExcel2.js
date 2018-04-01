//import xlsx from 'node-xlsx';
var xlsx = require('node-xlsx').default;

const fs = require('fs');

const pgp = require('pg-promise')({
    capSQL: true // generate capitalized SQL 
});

const cn = {
    host: '35.200.231.41', // 'localhost' is the default;
    port: 5432, // 5432 is the default;
    database: 'postgres',
    user: 'postgres',
    password: 'StanplusDev2018!'
};

const db = pgp(cn); // your database object

const cs = new pgp.helpers.ColumnSet([
    'vehicle','driver', 'thegroup', 'thedate', 'event', 'latitude', 'longitude', 'address'
], {table: 'azugalog'});

var data = [];
var files = [];

var folder = 'files/'

//reading files in folder files
fs.readdirSync(folder).forEach(file => {
  console.log("Found file: " + file);
  files.push(file);
})

console.log("Total of " + files.length + "files to process...");

async function processFiles(){
    
    for(const item of files){

        console.log("Starting with " + item);
        var ws = xlsx.parse(folder+item);

        var query = "";

        if (ws.length < 1){
            console.log("Error loading excel file");
            return;
        } 

        console.log("sheet length = " + ws[0].data.length);


        for(var i=6; i<ws[0].data.length; i++){
            var dl = ws[0].data[i];

            if(dl.length == 0) {
                break;
            }

            var toPush = {
                vehicle: dl[0],
                driver: dl[1],
                thegroup: dl[2],
                thedate: dl[3],
                event: dl[4],
                latitude: dl[5],
                longitude: dl[6],
                address: dl[7]
            }

            data.push(toPush);
        //        console.log(line);
        }

        const insert = pgp.helpers.insert(data, cs);

        await db.none(insert);
        
        console.log("erasing stuff");
        ws = {};
        toPush = {};
    
    }
    console.log("looks like we are outside");
}

processFiles().catch(function(err){
    console.log("there was a big error");
    console.log(err);
})

/*
console.log("sending query..." + query.length);
pool.query(query)
  .then(res => console.log(res.rows))
  .catch(e => {
    console.log("error in query");
    console.error(e.stack);
})
*/

