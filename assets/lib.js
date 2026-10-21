var h=htm.bind(preact.h),hk=preactHooks,useState=hk.useState,useEffect=hk.useEffect,useRef=hk.useRef,useCallback=hk.useCallback;
var STATUS={MASUK:'Menunggu',SPM_DIBAGI:'SPM dibagi',LOADING:'Loading',SELESAI_MUAT:'Selesai muat',RECEIVED:'Diterima',COMPLETED:'Selesai'};
var REFRESH='M17.65 6.35A7.96 7.96 0 0012 4a8 8 0 108 8h-2a6 6 0 11-1.76-4.24L13 11h7V4l-2.35 2.35z';

/* API: Apps Script web app. Alamat bawaan di assets/config.js, bisa diganti dari index.html (disimpan di browser). */
function apiUrl(){
  var u='';try{u=localStorage.getItem('antrian_la_url')||'';}catch(e){}
  return u||((window.ANTRIAN||{}).apiUrl)||'';
}
function call(fn,arg,retry){
  var url=apiUrl();
  if(!url)return Promise.reject(new Error('Alamat server belum diisi. Buka halaman utama lalu isi "Ubah link".'));
  var ac=window.AbortController?new AbortController():null,tm=ac?setTimeout(function(){ac.abort();},30000):0;
  return fetch(url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},redirect:'follow',signal:ac?ac.signal:undefined,
    body:JSON.stringify({fn:fn,arg:arg,key:store('antrian_la_key')})
  }).then(function(r){clearTimeout(tm);return r.json();}).then(function(j){
    if(j&&j.ok)return j.data;
    if(j&&j.code==='AUTH'&&!retry){
      var k=window.prompt('Masukkan kode akses:');
      if(k){store('antrian_la_key',k);return call(fn,arg,true);}
    }
    throw new Error((j&&j.error)||'Server tidak menjawab dengan benar.');
  },function(){clearTimeout(tm);throw new Error('Tidak bisa terhubung ke server. Periksa sinyal lalu coba lagi.');});
}

/* Menu samping (desktop) / menu bawah (HP). */
var NAVS=[['security','Security','M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z'],
['juru','Juru muat','M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z'],
['checker','Checker','M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'],
['dashboard','Dashboard','M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z']];
function mountNav(page){
  var x='<nav class="nav" aria-label="Menu">'+NAVS.map(function(n){
    return '<a href="'+n[0]+'.html"'+(n[0]===page?' class="on" aria-current="page"':'')+'><svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+n[2]+'"/></svg><span>'+n[1]+'</span></a>';
  }).join('')+'</nav>';
  document.body.insertAdjacentHTML('afterbegin',x);
}

function store(k,v){
  try{if(v===undefined)return localStorage.getItem(k)||'';localStorage.setItem(k,v);}catch(e){}
  return '';
}
function clock(){
  try{return new Date().toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit'});}catch(e){return '';}
}

/* Data hidup: ambil sekarang, ulang tiap ms (hanya saat tab terlihat), render ulang hanya bila data berubah. */
function todayJkt(){try{return new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Jakarta'});}catch(e){return '';}}
function useLive(load,ms,key){
  var s=useState(function(){
    var c=null;try{c=JSON.parse(store('lv_'+key)||'null');}catch(e){}
    if(c&&c.tanggal!==todayJkt())c=null;   /* data kemarin tidak ditampilkan */
    return{d:c,err:'',busy:false};
  }),st=s[0],set=s[1];
  var dr=useRef(null),hold=useRef(0);dr.current=st.d;
  useEffect(function(){if(st.d)store('lv_'+key,JSON.stringify(st.d));},[st.d]);
  var run=useCallback(function(manual){
    if(hold.current>0)return Promise.resolve();   /* jangan timpa tampilan saat aksi sedang diproses */
    if(manual===true)set(function(x){return Object.assign({},x,{busy:true});});
    return load().then(function(d){
      if(hold.current>0)return;
      set(function(x){
        var n=Object.assign({},x.d||{},d);
        return(!x.err&&!x.busy&&JSON.stringify(n)===JSON.stringify(x.d))?x:{d:n,err:'',busy:false};
      });
    },function(e){set(function(x){return{d:x.d,err:e.message,busy:false};});});
  },[]);
  var put=useCallback(function(d){set(function(x){return{d:Object.assign({},x.d||{},d),err:'',busy:false};});},[]);
  /* Perubahan sementara (optimistis): tampil langsung, dikembalikan bila server menolak. */
  var patch=useCallback(function(fn){
    var prev=dr.current;if(!prev)return null;
    var n=fn(prev);dr.current=n;set(function(x){return{d:n,err:x.err,busy:x.busy};});return prev;
  },[]);
  var restore=useCallback(function(prev){
    if(prev){dr.current=prev;set(function(x){return{d:prev,err:x.err,busy:x.busy};});}
  },[]);
  var holdBy=useCallback(function(n){hold.current=Math.max(0,hold.current+n);},[]);
  useEffect(function(){
    run();
    var i=setInterval(function(){if(!document.hidden)run();},ms);
    var v=function(){if(!document.hidden)run();};
    document.addEventListener('visibilitychange',v);
    return function(){clearInterval(i);document.removeEventListener('visibilitychange',v);};
  },[]);
  return{st:st,run:run,put:put,patch:patch,restore:restore,hold:holdBy};
}

function useToast(){
  var s=useState(null),t=s[0],set=s[1],tm=useRef(0);
  var show=useCallback(function(m,bad){
    set({m:m,bad:bad});clearTimeout(tm.current);
    tm.current=setTimeout(function(){set(null);},2800);
  },[]);
  return[t,show];
}

/* Satu pintu aksi: cegah klik ganda, tampilkan hasil dari server, muat ulang bila gagal. */
function useDo(L,toast){
  var s=useState(''),busy=s[0],setBusy=s[1];
  return{busy:busy,go:function(key,fn,arg,okMsg,opt){
    if(busy)return Promise.resolve();
    setBusy(key);L.hold(1);
    var prev=opt?L.patch(opt):null;
    try{if(navigator.vibrate)navigator.vibrate(12);}catch(e){}
    return call(fn,arg).then(function(r){
      L.hold(-1);setBusy('');if(r&&r.view)L.put(r.view);if(okMsg)toast(okMsg);return r;
    },function(e){
      L.hold(-1);setBusy('');if(prev)L.restore(prev);toast(e.message,true);L.run();
    });
  }};
}

function p2(n){return ('0'+n).slice(-2);}
/* Ubah satu kartu di daftar (fn mengembalikan null untuk menghapus) lalu hitung ulang giliran berikutnya. */
function patchList(x,id,fn){
  var l=(x.list||[]).map(function(c){return c.id===id?fn(c):c;}).filter(Boolean);
  var w=l.filter(function(c){return c.status==='MASUK';}).map(function(c){return Number(c.no);});
  return Object.assign({},x,{list:l,next:w.length?p2(Math.min.apply(null,w)):''});
}
function usePelaku(users,key){
  var s=useState(store(key)),v=s[0],set=s[1],u=users||[];
  var cur=u.indexOf(v)>=0?v:(u.length===1?u[0]:'');
  return[cur,function(x){set(x);store(key,x);}];
}

function Clock(p){
  var s=useState(clock()),t=s[0],set=s[1];
  useEffect(function(){var i=setInterval(function(){set(clock());},30000);return function(){clearInterval(i);};},[]);
  return h`<span>${p.date||''} · ${t}</span>`;
}
function Toast(p){return p.t?h`<div class=${'toast'+(p.t.bad?' bad':'')} role="status">${p.t.m}</div>`:null;}

function Shell(p){
  var L=p.live,d=L.st.d||{};
  return h`<div>
    <header class="top"><h1>${p.title}</h1>
      <div class="r"><${Clock} date=${d.tanggal}/>
        <button class=${'ic'+(L.st.busy?' spin':'')} onClick=${function(){L.run(true);}} aria-label="Muat ulang"><svg viewBox="0 0 24 24"><path d=${REFRESH}/></svg></button>
      </div></header>
    <main class=${p.wide?'wide':''}>
      ${L.st.err?h`<div class="err">${L.st.err}</div>`:null}
      ${d.tanggal?p.children:(L.st.err?null:h`<div class="box"><div class="sk"></div><div class="sk"></div><div class="sk"></div></div>`)}
    </main>
    <${Toast} t=${p.toast}/>
  </div>`;
}

function Sheet(p){
  useEffect(function(){
    var k=function(e){if(e.key==='Escape')p.onClose();};
    document.addEventListener('keydown',k);
    return function(){document.removeEventListener('keydown',k);};
  },[]);
  return h`<div class="ov" onClick=${p.onClose}><div class="sheet" role="dialog" aria-modal="true" onClick=${function(e){e.stopPropagation();}}><h2>${p.title}</h2>${p.children}</div></div>`;
}

/* Konfirmasi satu langkah sebelum aksi yang tidak bisa dibatalkan. */
function Confirm(p){
  return h`<${Sheet} title=${p.title} onClose=${p.onClose}>
    ${p.text?h`<p style="margin:0 0 14px">${p.text}</p>`:null}
    ${p.children}
    <div class="row">
      <button class="btn g" onClick=${p.onClose}>Batal</button>
      <button class="btn" disabled=${p.busy||p.disabled} onClick=${p.onOk}>${p.busy?'Memproses…':p.okLabel}</button>
    </div></${Sheet}>`;
}

function Who(p){
  var u=p.users||[];
  if(!u.length)return h`<div class="warn">Belum ada nama petugas untuk peran ini. Isi dulu di tab USER.</div>`;
  if(u.length===1)return h`<p class="pt">Petugas: <b>${u[0]}</b></p>`;
  return h`<div class=${p.value?'':'need'}><label>Nama Anda<select value=${p.value} onChange=${function(e){p.set(e.target.value);}}>
    <option value="">Pilih nama…</option>
    ${u.map(function(x){return h`<option value=${x}>${x}</option>`;})}
  </select></label>${p.value?null:h`<div class="hint">Pilih nama Anda dulu agar tombol bisa dipakai.</div>`}</div>`;
}

function Car(p){
  var c=p.c,t=[['Masuk',c.masuk],['Mulai',c.start],['Terima',c.receive]].filter(function(x){return x[1];});
  return h`<article class=${'car'+(p.hot?' hot':'')}>
    <div class="no">${c.no}</div>
    <div class="bd">
      <div class="l1"><b>${c.nopol}</b><span class=${'chip s-'+c.status}>${STATUS[c.status]||c.status}</span>${p.hot?h`<span class="chip tag">Giliran sekarang</span>`:null}</div>
      <div class="mut">${[c.sopir,c.tujuan].filter(Boolean).join(' · ')||'—'}</div>
      <div class="tm">${t.map(function(x){return h`<span>${x[0]} ${x[1]}</span>`;})}
        ${c.mnt!=null&&c.status!=='COMPLETED'?h`<span class="el">${c.mnt} mnt</span>`:null}</div>
      ${c.exc?h`<div class="wr">Lompat antrean${c.alasan?': '+c.alasan:''}</div>`:null}
    </div>
    ${p.children?h`<div>${p.children}</div>`:null}
  </article>`;
}
