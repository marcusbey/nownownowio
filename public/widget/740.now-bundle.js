"use strict";(this.webpackChunkNowNowNowWidget=this.webpackChunkNowNowNowWidget||[]).push([[740],{740:(e,t,n)=>{n.r(t),n.d(t,{default:()=>l});var a=n(859),r=n(540),o=function(e,t,n,a){return new(n||(n=Promise))((function(r,o){function l(e){try{c(a.next(e))}catch(e){o(e)}}function s(e){try{c(a.throw(e))}catch(e){o(e)}}function c(e){var t;e.done?r(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(l,s)}c((a=a.apply(e,t||[])).next())}))};const l=({userId:e,token:t,posts:n,user:l})=>{const[s,c]=(0,r.useState)(n),[i,u]=(0,r.useState)(l),[d,m]=(0,r.useState)(!0),[h,f]=(0,r.useState)(null);return(0,r.useEffect)((()=>{o(void 0,void 0,void 0,(function*(){try{const n=yield(0,a.h)(`userData_${e}`,(()=>o(void 0,void 0,void 0,(function*(){const n=yield fetch(`/api/widget/userData?userId=${e}`,{headers:{Authorization:`Bearer ${t}`}});if(!n.ok)throw new Error(`HTTP error! status: ${n.status}`);return n.json()}))));if(!n.success)throw new Error(n.error||"Failed to fetch data");c(n.data.recentPosts),u(n.data.user)}catch(e){f(e instanceof Error?e.message:"An unexpected error occurred")}finally{m(!1)}}))}),[e,t]),d?r.createElement("div",null,"Loading..."):h?r.createElement("div",null,"Error: ",h):r.createElement("div",{className:"sidepanel-content"},i&&r.createElement("div",{className:"user-info"},r.createElement("img",{src:i.avatarUrl,alt:i.displayName,className:"avatar"}),r.createElement("h2",null,i.displayName)),r.createElement("h3",null,"Recent Posts"),0===s.length?r.createElement("p",null,"No posts available."):r.createElement("ul",null,s.map((e=>r.createElement("li",{key:e.id},r.createElement("p",null,e.content),r.createElement("small",null,new Date(e.createdAt).toLocaleString()))))))}}}]);
//# sourceMappingURL=740.now-bundle.js.map