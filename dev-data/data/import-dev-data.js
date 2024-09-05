const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel.js');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB).then(() => {
  console.log('DB connection successful');
});
const tours= JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));
const importData = async () =>{
      try {
      await Tour.create(tours);
      console.log('Data successfully loaded');
      process.exit()
      } catch (error) {
      console.log(error);
      }
}
//delete all data from the collection
const deleteData = async () =>{
      try {
      await Tour.deleteMany();
      console.log('Data successfully deleted');
      process.exit();
      } catch (error) {
      console.log(error);
      }
      
}
if(process.argv[2] === '--import'){
      importData();
}
if(process.argv[2] === '--delete'){
      deleteData();
}
console.log(process.argv);