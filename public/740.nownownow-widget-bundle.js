"use strict";(this.webpackChunkNowNowNowWidget=this.webpackChunkNowNowNowWidget||[]).push([[740],{740:(e,t,n)=>{n.r(t),n.d(t,{default:()=>s});var a=n(859),r=n(883),o=n.n(r),l=function(e,t,n,a){return new(n||(n=Promise))((function(r,o){function l(e){try{c(a.next(e))}catch(e){o(e)}}function s(e){try{c(a.throw(e))}catch(e){o(e)}}function c(e){var t;e.done?r(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(l,s)}c((a=a.apply(e,t||[])).next())}))};const s=({userId:e,token:t,posts:n,user:s})=>{const[c,i]=(0,r.useState)(n),[u,d]=(0,r.useState)(s),[m,h]=(0,r.useState)(!0),[f,v]=(0,r.useState)(null);return(0,r.useEffect)((()=>{l(void 0,void 0,void 0,(function*(){try{const n=yield(0,a.h)(`userData_${e}`,(()=>l(void 0,void 0,void 0,(function*(){const n=yield fetch(`/api/widget/userData?userId=${e}`,{headers:{Authorization:`Bearer ${t}`}});if(!n.ok)throw new Error(`HTTP error! status: ${n.status}`);return n.json()}))));if(!n.success)throw new Error(n.error||"Failed to fetch data");i(n.data.recentPosts),d(n.data.user)}catch(e){v(e instanceof Error?e.message:"An unexpected error occurred")}finally{h(!1)}}))}),[e,t]),m?o().createElement("div",null,"Loading..."):f?o().createElement("div",null,"Error: ",f):o().createElement("div",{className:"sidepanel-content"},u&&o().createElement("div",{className:"user-info"},o().createElement("img",{src:u.avatarUrl,alt:u.displayName,className:"avatar"}),o().createElement("h2",null,u.displayName)),o().createElement("h3",null,"Recent Posts"),0===c.length?o().createElement("p",null,"No posts available."):o().createElement("ul",null,c.map((e=>o().createElement("li",{key:e.id},o().createElement("p",null,e.content),o().createElement("small",null,new Date(e.createdAt).toLocaleString()))))))}}}]);
//# sourceMappingURL=740.nownownow-widget-bundle.js.map