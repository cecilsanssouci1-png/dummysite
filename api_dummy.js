/* api_dummy.js
 A tiny in-browser "API" that returns contacts and messages.
 Persists sent messages to localStorage so it feels real.
*/

const API = (function(){
  const LS_KEY = 'webogram_demo_msgs_v1';

  // sample contacts
  const contacts = [
    { id: 'u1', name: 'Ava', about: 'Design & coffee', avatar: 'A' },
    { id: 'u2', name: 'Noah', about: 'Travel photos', avatar: 'N' },
    { id: 'u3', name: 'Maya', about: 'Work updates', avatar: 'M' }
  ];

  // sample message seeds
  const seed = {
    u1: [
      { from: 'u1', text: 'Hey! 👋 How are tests going?', t: Date.now() - 1000*60*60 },
      { from: 'me', text: 'Good! Wrapping up a demo.', t: Date.now() - 1000*60*50 }
    ],
    u2: [
      { from: 'u2', text: 'Check this out — new shots.', t: Date.now() - 1000*60*60*3 }
    ],
    u3: [
      { from: 'u3', text: 'Meeting at 3pm', t: Date.now() - 1000*60*60*6 }
    ]
  };

  function loadStorage(){
    try{
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : seed;
    }catch(e){ return seed; }
  }
  function saveStorage(data){
    try{ localStorage.setItem(LS_KEY, JSON.stringify(data)); }catch(e){}
  }

  let store = loadStorage();

  return {
    listContacts: async function(){
      // emulate network
      await new Promise(r=>setTimeout(r,120));
      return contacts;
    },
    getMessages: async function(chatId){
      await new Promise(r=>setTimeout(r,120));
      return (store[chatId] || []).slice().sort((a,b)=>a.t-b.t);
    },
    sendMessage: async function(chatId, text){
      const msg = { from:'me', text: text, t: Date.now() };
      store[chatId] = store[chatId] || [];
      store[chatId].push(msg);
      saveStorage(store);
      await new Promise(r=>setTimeout(r,80));
      // auto-reply for demo (friendly)
      setTimeout(()=>{
        const reply = { from: chatId, text: "Auto-reply: got \""+ text + "\"", t: Date.now()+2000 };
        store[chatId].push(reply);
        saveStorage(store);
        // notify app (dispatch custom event)
        window.dispatchEvent(new CustomEvent('api:message', { detail:{ chatId, msg:reply } }));
      }, 800 + Math.random()*800);
      return msg;
    }
  };
})();
