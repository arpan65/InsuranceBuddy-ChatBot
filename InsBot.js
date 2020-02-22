'use strict';
//https://inshelper-akrvxv.firebaseio.com/
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const admin = require('firebase-admin');
// replace with your database connection string
admin.initializeApp({
 databaseURL:'ws:://inshelper-akrvxv.firebaseio.com/',});

// initialize connections
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  function getNameHandler(agent) {
    var ref=admin.database().ref('data');
    return ref.orderByChild('test').equalTo('abc').once('value', function(snap){
    if(snap.exists()){
        agent.add(snap.child('policy/insured').val());
        
    }
  });
}
// method to handle policy releted information
    function policyHandler(agent) {
    const policynumber=agent.parameters.policynumber;  
    const passcode=agent.parameters.passcode;
    var ref=admin.database().ref('data/policy');
    return ref.orderByChild('Policy ID').equalTo(policynumber).once('value', function(snap){
    if(snap.exists()){
        var passcode_db=snap.child(policynumber+'/passcode').val();
       if(passcode==passcode_db){
         agent.add('policy and passcode matched');
       }
      else{
        agent.add('Passcode wrong.'+passcode_db);
        //agent.add(snap.child('policy/insured').val());
      }
    }
      else{
      agent.add('Incorrent policy number entered');}
  });
}
// method to handle policy premium releted information
   function policyPremiumHandler(agent) {
    const policynumber=agent.parameters.policynumber;  
    const passcode=agent.parameters.passcode;
    var ref=admin.database().ref('data/policy');
    return ref.orderByChild('Policy ID').equalTo(policynumber).once('value', function(snap){
    if(snap.exists()){
        var passcode_db=snap.child(policynumber+'/passcode').val();
        if(passcode==passcode_db){
        var premium=snap.child(policynumber+'/Premium').val();
        var premium_date=snap.child(policynumber+'/Next Premium Date').val();  
        agent.add('Your premium amount is $'+premium+' and next due date is '+premium_date);
        }
      else{
        agent.add("Sorry your passcode did not match");
      }
    }
      else{
      agent.add('Ops! seems like this policy number does not exists');}
  });
}
// sample function to save a value to database
 function handleSaveToDB(agent) {
   const text=agent.parameters.text;
   const name=agent.parameters.name;
   agent.add('The Value added sucessfully: '+text);
   agent.add('The updated name: '+name);
   return admin.database().ref('data').set({
     text:text
   });
  }
  // method to handle call back request
   function callbackHandler(agent) {
   var db = admin.database();
   var ref = db.ref("data");
   const phone=agent.parameters.phone;  
   const name=agent.parameters.name;
   var postsRef = ref.child("Query");
   var newPostRef = postsRef.push();
   newPostRef.set({
    name: name,
    phone: phone
});
     agent.add('Thanks '+name+'!I have scheduled a callback request for you.');
     agent.add('Please be assured, our customer executive will call you at the earliest.');
  }
  // method to handle cusotomer complains and create help desk tickets, follow up intent after Complain intent 
   function ComplaincallbackHandler(agent) {
   var db = admin.database();
   var ref = db.ref("data");
   const phone=agent.parameters.phone;  
   const name=agent.parameters.name;
   var postsRef = ref.child("Query");
   var newPostRef = postsRef.push();
   newPostRef.set({
    name: name,
    phone: phone
});
     agent.add('Thanks '+name+'!I have scheduled a callback request for you.');
     agent.add('Please be assured, our customer executive will call you at the earliest.');
  }
  // method to handle customer complains
     function  complainHandler(agent) {
   var db = admin.database();
   var ref = db.ref("data");
   const complain=agent.parameters.complain;  
   const name=agent.parameters.name;
   var postsRef = ref.child("Complain");
   var newPostRef = postsRef.push();
   var postId = newPostRef.key;
   newPostRef.set({
      name: name,
      complain: complain,
      id: postId.substring(1,6),
      status:'New'
   });
       
       
     agent.add('Thanks '+name+', Please be assured It will be handled as a priority.');
     //agent.add('Please be assured It will be handled as priority.');
     agent.add('Your ticket id is '+postId.substring(1,6)+'. please note this for further communications.');  
  }
  // mapping intents
  let intentMap = new Map();
  intentMap.set('ReadFromDB', getNameHandler);
  intentMap.set('WriteToDB', handleSaveToDB);
  intentMap.set('RequestCallBack', callbackHandler);
  intentMap.set('Complain', complainHandler);
  intentMap.set('policy', policyHandler);
  intentMap.set('premium', policyPremiumHandler);
   intentMap.set('ComplainCallback', ComplaincallbackHandler);
  agent.handleRequest(intentMap);
});