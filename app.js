// app.js - glue to render UI with api_dummy and router
(async function(){
  const sidebarEl = document.getElementById('sidebar');
  const mainEl = document.getElementById('main');
  const rightEl = document.getElementById('rightpane');

  function el(html){ const d=document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }

  // render sidebar
  async function renderSidebar(filter=''){
    const contacts = await API.listContacts();
    sidebarEl.innerHTML = '';
    const brand = el(`<div class="brand">Webogram Clone</div>`);
    const search = el(`<div class="search"><input id="search" placeholder="Search contacts..." /></div>`);
    sidebarEl.appendChild(brand);
    sidebarEl.appendChild(search);
    const list = document.createElement('div');
    contacts.filter(c=>c.name.toLowerCase().includes(filter.toLowerCase())).forEach(c=>{
      const snippet = (c.about || '').slice(0,40);
      const node = el(`<div class="contact" data-id="${c.id}">
        <div class="avatar">${c.avatar}</div>
        <div class="meta"><div class="name">${c.name}</div><div class="snippet">${snippet}</div></div>
      </div>`);
      node.addEventListener('click', ()=> {
        location.hash = `/chat/${c.id}`;
      });
      list.appendChild(node);
    });
    sidebarEl.appendChild(list);

    // search handler
    search.querySelector('input').addEventListener('input', (e)=> renderSidebar(e.target.value));
  }

  // render right pane (settings)
  function renderRight(){
    rightEl.innerHTML = '';
    const s = document.createElement('div');
    s.className='section';
    s.innerHTML = `<h4>Profile</h4><div class="empty">You — demo user</div>`;
    rightEl.appendChild(s);

    const s2 = document.createElement('div'); s2.className='section';
    s2.innerHTML = `<h4>App</h4><div class="empty">Local demo mode. Messages stored in browser.</div>`;
    rightEl.appendChild(s2);
  }

  // load view fragment by URL from views/*.html or fallback inline
  async function loadView(path){
    try {
      const r = await fetch(path);
      if(!r.ok) throw new Error('failed');
      return await r.text();
    } catch(e){
      // fallback
      return `<div class="loading">Failed to load view: ${path}</div>`;
    }
  }

  // render chat view for id
  async function renderChat(id){
    mainEl.innerHTML = '';
    const headerHtml = `<div class="chat-header"><div class="avatar">?${id}</div><div class="title">Chat — ${id}</div></div>`;
    const container = document.createElement('div');
    container.innerHTML = headerHtml + `<div class="messages" id="messages"></div>
      <div class="input-row"><input id="msginput" placeholder="Type a message..." /><button class="btn" id="sendbtn">Send</button></div>`;
    mainEl.appendChild(container);

    const msgsEl = document.getElementById('messages');
    function renderMessages(list){
      msgsEl.innerHTML='';
      list.forEach(m=>{
        const cls = m.from === 'me' ? 'msg me' : 'msg';
        const node = document.createElement('div'); node.className = cls;
        node.innerHTML = `<div class="meta">${m.from==='me'?'You':m.from} • ${new Date(m.t).toLocaleTimeString()}</div><div class="text">${escapeHtml(m.text)}</div>`;
        msgsEl.appendChild(node);
      });
      msgsEl.scrollTop = msgsEl.scrollHeight;
    }

    // load messages
    const list = await API.getMessages(id);
    renderMessages(list);

    // handle send
    document.getElementById('sendbtn').addEventListener('click', async ()=>{
      const input = document.getElementById('msginput');
      const text = input.value.trim(); if(!text) return;
      input.value = '';
      await API.sendMessage(id, text);
      const newList = await API.getMessages(id);
      renderMessages(newList);
    });

    // handle external event for auto reply
    window.addEventListener('api:message', (ev)=>{
      if(ev.detail && ev.detail.chatId === id){
        // append
        API.getMessages(id).then(renderMessages);
      }
    });
  }

  // helper
  function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // root/home view: basic welcome
  async function renderHome(){
    mainEl.innerHTML = `<h2>Welcome</h2><p class="empty">Choose a chat from the left to start.</p>`;
  }

  // initialize
  renderSidebar();
  renderRight();

  // define routes
  Router.on(/^\/$/, ()=> renderHome());
  Router.on(/^\/chat\/([a-z0-9_-]+)$/, (m)=> {
    const id = m[1];
    renderChat(id);
  });

  Router.start();
})();
