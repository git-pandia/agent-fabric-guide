'use strict';
/* Scenario-free architecture tour. Teaching relationships, not runtime telemetry.
   Loaded after the existing engines so all four business stories stay unchanged. */
(() => {
  const original = {makeSteps, loadScenario, renderExplanation, renderGraph, renderPacket, renderControls, renderTrace, selectComponent, openModal};
  const active = () => state.scenario === 'architecture';
  const byId = id => document.getElementById(id);
  const link = key => sourceLink(key, 'Official documentation');
  Object.assign(SOURCES, {
    deployment: {title:'Deploying agent network instances', detail:'Deployment lifecycle, connections, brokers, and environments', url:'https://docs.mulesoft.com/agent-network/latest/af-deploy-agent-network-targets'},
    modelProxy: {title:'Model proxies and LLM connections', detail:'Managed model access, routing, and connection types', url:'https://docs.mulesoft.com/general/model-proxy'},
    projectFiles: {title:'Agent network project files', detail:'Network definitions, dependencies, and Agent Script', url:'https://docs.mulesoft.com/agent-network/latest/af-project-files'}
  });
  const stages = [
    {title:'The whole architecture', tag:'01 / The big picture', icon:'fabric', source:'overview', nodes:['registry','governance','visualizer','broker','agents','tools'], motions:[],
      simple:'Agent Fabric is the control plane around an ecosystem of agents, tools, models, and APIs. It helps teams discover capabilities, coordinate work, enforce rules, and understand their network.',
      technical:'This is a logical reference architecture, not a deployment topology or a captured trace. Management capabilities sit above runtime interactions; the build and deployment lifecycle sits below them.',
      distinction:'The fabric is not one giant agent, and its capabilities do not all need to be used in every request.', takeaway:'Read the map in three layers: manage, run, and build/deploy.', checks:['Management: inventory, policies, and operational visibility.','Runtime: the actual callers, brokers, agents, models, and tools.','Lifecycle: project definitions, published assets, and deployed instances.']},
    {title:'Discover and reuse capabilities', tag:'02 / Registry and scanners', icon:'grid', source:'registry', extra:'scanners', nodes:['registry'], motions:[],
      simple:'The registry is the shared inventory of agents, MCP servers, model proxies, APIs, and related services. Scanners can discover services on supported providers and add them to the matching catalogs.',
      technical:'Inspect asset metadata, versions, available instances, and governance information before reusing a capability. Scanner coverage depends on the supported provider, service type, credentials, and permissions.',
      distinction:'Registering an asset does not deploy its implementation or automatically authorize every caller.', takeaway:'The registry is a discovery capability, not a required hop in each business request.', checks:['Find or publish a reusable asset.','Check the supported interface and relevant instance.','Use configured scanners to keep the inventory current.']},
    {title:'Define and publish the network', tag:'03 / Design time', icon:'code', source:'projectFiles', extra:'define', nodes:['build','registry'], motions:[],
      simple:'In Anypoint Code Builder, define the network connections and the broker workflow. Test the configuration, then publish the appropriate assets to Exchange so other teams can find and reuse them.',
      technical:'Current projects use agent-network.yaml for the network configuration, broker .agent files for Agent Script graphs, and exchange.json for asset metadata and dependencies. Publishing and deploying are different lifecycle operations.',
      distinction:'An asset describes a reusable capability. Publishing that asset is not the same as starting a running service.', takeaway:'Design what the network can do before putting it into an environment.', checks:['agent-network.yaml: assets, connections, and policies.','Broker .agent files: nodes and transitions.','exchange.json: Exchange metadata and dependencies.']},
    {title:'Deploy and create instances', tag:'04 / Deployment and instances', icon:'cloud', source:'deployment', nodes:['instances','gateway','broker','proxy'], motions:[],
      simple:'Deployment turns the configuration into environment-specific runtime and managed resources. An instance identifies a deployed or managed realization of a capability, with the endpoint and configuration relevant to that environment.',
      technical:'Agent network deployment creates one instance for each configured connection and one per broker. A managed connection can front an existing external service; it does not mean that service was copied into MuleSoft. Runtime replicas are a separate scaling concept.',
      distinction:'An instance is not created for each user question. A new request uses the deployed endpoints.', takeaway:'Asset = reusable definition. Managed instance = environment-specific endpoint/configuration. Replica = a running execution copy.', checks:['Choose the environment, supported target, and gateways.','Check deployment status, managed instances, endpoints, and policies.','Distinguish the consumer-facing URL from the upstream service URL.']},
    {title:'Enter through a protected endpoint', tag:'05 / Entry and gateway', icon:'shield', source:'gateway', nodes:['client','gateway','governance'], motions:[['entry'],['ingress']],
      simple:'A person or application calls an exposed endpoint. Omni Gateway applies the policies configured on the protected path, such as authentication and usage controls, before forwarding the request.',
      technical:'Ingress and egress enforcement can involve separate managed gateway paths. This diagram compresses them into one gateway block and endpoint boundary labels; it does not imply that one gateway intercepts every possible connection.',
      distinction:'Permission to call the entry endpoint is not permission to use every downstream agent or tool.', takeaway:'The gateway enforces rules; it does not decide the business task.', checks:['Identify the actual endpoint the client calls.','Verify applicable authentication and authorization.','Keep downstream tool and model controls explicit.']},
    {title:'Coordinate with Agent Broker', tag:'06 / Orchestration', icon:'broker', source:'define', nodes:['broker','agents','tools'], motions:[['delegate']],
      simple:'The broker coordinates work across configured capabilities. It can delegate to specialist agents, call tools, and combine results without making every specialist understand the whole network.',
      technical:'Agent Script graphs mix deterministic control flow with model-assisted nodes. The graph, available connections, and returned results determine the next action. A broker can also invoke MCP tools directly when the workflow requires it.',
      distinction:'A broker is not just an LLM. It is an orchestrated application that can use an LLM.', takeaway:'Use a broker when coordination is useful; it is not mandatory for every Agent Fabric adoption.', checks:['Separate graph routing from model-generated text.','Reference only the intended agents and tools.','Handle returned errors and approval states explicitly.']},
    {title:'Connect through an LLM proxy', tag:'07 / Models and model access', icon:'spark', source:'modelProxy', nodes:['broker','proxy','model'], motions:[['modelAccess'],['modelProvider'],['modelProvider',true],['modelAccess',true]],
      simple:'The language model supplies language intelligence. A Model Proxy is the managed access layer between an AI client and supported model providers, with routing and applicable controls on that path.',
      technical:'A Proxy configuration can route to one or more providers. A Connection stores access configuration for a specific provider and can appear as a single-route proxy managed by an external project, such as an agent network. Supported routing and policies depend on configuration.',
      distinction:'The proxy is not the LLM, and deploying a proxy does not train or host the provider model.', takeaway:'Model calls are side interactions used where needed, not a mandatory stop for every operation.', checks:['Separate caller credentials from provider credentials.','Verify model routing and applicable usage or safety controls.','Treat model output as fallible; ground answers in returned facts.']},
    {title:'Delegate to specialist agents', tag:'08 / Agent2Agent (A2A)', icon:'agent', source:'a2a', extra:'a2abridge', nodes:['broker','agents'], motions:[['delegate'],['delegate',true]],
      simple:'A specialist agent takes responsibility for a focused task and returns a result. It can use its own logic, model, and permitted tools, and can run on a different platform.',
      technical:'A2A provides the agent-to-agent interface for task delegation. Supported non-A2A agents can be adapted through an A2A bridge; the A2A Connector enables Mule applications to participate as clients or servers.',
      distinction:'A2A delegates work to an agent. It does not expose that agent\'s private implementation or grant extra permissions.', takeaway:'Reuse specialist capabilities through a common interface.', checks:['Check the agent interface and advertised capabilities.','Validate the task and result contracts.','Keep success, failure, and pending states explicit.']},
    {title:'Connect tools to existing systems', tag:'09 / MCP, APIs, and integrations', icon:'tool', source:'mcp', extra:'bridge', nodes:['broker','agents','tools','systems'], motions:[['toolCall'],['backend'],['backend',true],['toolCall',true],['directTool'],['directTool',true]],
      simple:'An MCP server exposes named tools and context. The tool implementation calls the relevant business API or system and returns its result. A broker or specialist can be the MCP client.',
      technical:'MCP Bridge exposes selected existing API operations as tools. MCP Connector supports custom Mule client/server implementations and integration logic. The connection behind a tool uses the protocol supported by that backing system, not necessarily MCP.',
      distinction:'An agent chooses and performs a task. A tool exposes an operation. The business system remains the source of its data and action results.', takeaway:'The dashed direct-MCP line is an alternative route, not an extra compulsory handoff.', checks:['Define tool names, input schemas, and allowed operations.','Validate inputs and returned data in the integration.','Handle backend errors and required approvals explicitly.']},
    {title:'Enforce governance across the paths', tag:'10 / Policies and boundaries', icon:'lock', source:'access', extra:'policies', nodes:['governance','gateway','agents','tools','proxy'], motions:[],
      simple:'Governance defines who can call a capability, which operations are allowed, and which limits apply. Gateway enforcement makes the configured rules effective on the traffic routed through those boundaries.',
      technical:'Use compatible authentication, access, rate, MCP, and LLM policies on the relevant managed endpoints. Agent network deployment applies certain built-in policies; additional access, business approval, and safety requirements must still be designed and verified.',
      distinction:'Inventory visibility is not authorization. A shield or a registered asset does not prove that unproxied traffic is covered.', takeaway:'Coordinate with the broker; enforce permissions at the appropriate runtime boundary.', checks:['Verify ingress and egress coverage.','Apply least-privilege tool access and applicable model limits.','Do not route around a denial or invent an approval.']},
    {title:'Observe and operate the network', tag:'11 / Visualizer and monitoring', icon:'eye', source:'visualizer', nodes:['visualizer','instances'], motions:[],
      simple:'Agent Visualizer helps teams understand the connected assets, call direction, available traffic information, and policy coverage. Monitoring and logs support investigation of the deployed services.',
      technical:'Runtime visibility depends on the registered assets, supported deployment, and available gateway telemetry. Use the appropriate environment and instance context when investigating connections and their metrics.',
      distinction:'This guide is a teaching map, not the actual Agent Visualizer or a source of live telemetry.', takeaway:'Observability describes what the network did; it is not an extra processing hop after every response.', checks:['Compare declared relationships with observed activity.','Inspect the relevant environment, instances, logs, and metrics.','Do not equate an activity trace with hidden model reasoning.']},
    {title:'Put the architecture together', tag:'12 / The complete picture', icon:'fabric', source:'overview', nodes:['registry','governance','visualizer','client','gateway','broker','agents','tools','proxy','model','systems','build','instances'], motions:[['entry'],['ingress'],['delegate'],['toolCall'],['backend'],['backend',true],['toolCall',true],['delegate',true],['ingress',true],['entry',true]],
      simple:'Discover the capabilities, define and deploy the required connections, coordinate work where needed, enforce controls, and inspect the results. These are complementary responsibilities, not a list of mandatory hops.',
      technical:'The animated path illustrates one possible interaction pattern without a business scenario. Actual networks can omit the broker, use direct MCP calls, include more agents, or use different hosting and enforcement arrangements.',
      distinction:'No business example, sample weather, ticket, or generated result is being executed here.', takeaway:'Agent Fabric connects an ecosystem. Your chosen architecture uses only the capabilities that the workload needs.', checks:['Management is separate from runtime calls.','LLM access, agent delegation, and tool invocation are distinct.','Deployment creates managed instances; requests use them.']}
  ].map(s => ({...s, routes:[], duration:9500}));

  SCENARIOS.architecture = {architecture:true, title:'Overall Agent Fabric architecture', icon:'fabric', request:'Explore the architecture without a business example.', requestLabel:'Architecture overview', user:'Client / app', agentA:'Specialist agents', agentB:'Other agents', agentADesc:'A2A task delegation', agentBDesc:'Optional capabilities', toolA:'MCP tools', toolB:'Other tools', toolADesc:'Expose operations', toolBDesc:'Optional operations', systemA:'Existing APIs and systems', systemB:'', readTool:'Configured tools', writeTool:'Configured tools'};
  byId('scenario-select').add(new Option(SCENARIOS.architecture.title,'architecture'),0);

  const node = (id,title,desc,ico,step,tone='') => `<button class="arch-node ${tone}" data-arch-node="${id}" data-arch-step="${step}" aria-label="Explore ${esc(title)}"><span class="arch-node-icon">${icon(ico)}</span><strong>${esc(title)}</strong><span>${esc(desc)}</span></button>`;
  const host = document.createElement('section');
  host.id='architecture-map'; host.hidden=true; host.setAttribute('aria-label','Overall Agent Fabric architecture');
  host.innerHTML=`<div class="arch-intro"><div><div class="eyebrow">The whole picture</div><h2>Understand the architecture.<br><em>Without a business example.</em></h2></div><button class="arch-reset" data-arch-step="0">${icon('fabric')}Overview</button></div>
    <div class="arch-scroll" id="architecture-scroll" role="region" aria-label="Architecture map. On small screens, scroll horizontally to see all components." tabindex="0"><div class="arch-canvas">
      <div class="arch-layer-title"><span>01 / Manage the ecosystem</span><small>Not serial request hops</small></div>
      <div class="arch-management">${node('registry','Registry & scanners','Discover, catalog, and reuse','grid',2)}${node('governance','Governance','Define access and usage rules','shield',10)}${node('visualizer','Visualizer & monitoring','Inspect relationships and activity','eye',11)}</div>
      <div class="arch-layer-title"><span>02 / Runtime interactions</span><small>Logical relationships, not physical hosting</small></div>
      <div class="arch-runtime" id="architecture-runtime">
        <svg id="architecture-lines" class="arch-lines" aria-hidden="true"><defs><marker id="arch-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1 1 L8 5 L1 9" fill="none" stroke="#b9b3cc" stroke-width="1.4"/></marker></defs><g id="architecture-paths"></g><g id="architecture-packet" style="display:none"><circle r="11" class="arch-halo"/><circle r="4.5" class="arch-dot"/></g></svg>
        ${node('client','Client / app','Starts an interaction','user',5)}${node('gateway','Omni Gateway','Protected entry path','shield',5,'arch-amber')}${node('broker','Agent Broker','Coordinates the work','broker',6,'arch-purple')}${node('agents','Specialist agents','Delegate through A2A','agent',8,'arch-blue')}${node('tools','MCP servers & tools','Expose capabilities','tool',9,'arch-mint')}${node('proxy','Model Proxy','Managed LLM access','shield',7,'arch-purple')}${node('model','LLM provider','Language intelligence','spark',7,'arch-purple')}${node('systems','APIs & systems','Data and business actions','cloud',9,'arch-mint')}
        <div class="arch-boundary-note">${icon('shield')}Policies also apply at configured downstream endpoints. Not all traffic passes through one gateway.</div>
      </div>
      <div class="arch-layer-title"><span>03 / Build and deploy</span><small>A lifecycle, not part of each request</small></div>
      <div class="arch-lifecycle">${node('build','Define & publish','Code Builder / Agent Script / Exchange','code',3)}${node('instances','Deploy & manage instances','Environment-specific endpoints and runtime','cloud',4)}</div>
    </div></div>
    <div class="arch-footnote"><span id="architecture-status">Click a component, or play the architecture tour.</span><span>No live connections</span></div><p class="arch-mobile-hint">Swipe the map to see all the components &rarr;</p>`;
  document.querySelector('.map-area').appendChild(host);
  byId('architecture-scroll').addEventListener('pointerdown',()=>{if(active()&&state.playing)pause();});

  const edges = [
    ['entry','client','gateway','across','','purple'],
    ['ingress','gateway','broker','across','','purple'],
    ['delegate','broker','agents','across','A2A','blue'],
    ['toolCall','agents','tools','across','MCP','mint'],
    ['modelAccess','broker','proxy','down','LLM access','purple'],
    ['modelProvider','proxy','model','across','LLM','purple'],
    ['backend','tools','systems','down','API / integration','mint'],
    ['directTool','broker','tools','over','Optional direct MCP','mint']
  ];
  const svgNS='http://www.w3.org/2000/svg';
  edges.forEach(([id,,,,label,tone])=>{
    const path=document.createElementNS(svgNS,'path');path.id=`arch-edge-${id}`;path.setAttribute('class',`arch-edge ${tone} ${id==='directTool'?'optional':''}`);path.setAttribute('marker-end','url(#arch-arrow)');byId('architecture-paths').appendChild(path);
    const text=document.createElementNS(svgNS,'text');text.id=`arch-label-${id}`;text.setAttribute('class',`arch-protocol ${id==='directTool'?'always':''}`);text.textContent=label;byId('architecture-paths').appendChild(text);
  });
  function drawLines(){
    if(!active()||host.hidden)return;
    const area=byId('architecture-runtime'), bounds=area.getBoundingClientRect();
    if(!bounds.width)return;
    byId('architecture-lines').setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);
    const rect=id=>{const r=host.querySelector(`[data-arch-node="${id}"]`).getBoundingClientRect();return {x:r.x-bounds.x,y:r.y-bounds.y,w:r.width,h:r.height};};
    edges.forEach(([id,from,to,shape])=>{
      const a=rect(from),b=rect(to);let d,x,y;
      if(shape==='across'){const sy=a.y+a.h/2,ey=b.y+b.h/2;d=`M${a.x+a.w+2} ${sy} L${b.x-3} ${ey}`;x=(a.x+a.w+b.x)/2;y=Math.min(sy,ey)-9;}
      else if(shape==='down'){x=a.x+a.w/2;const end=b.x+b.w/2;d=`M${x} ${a.y+a.h+2} L${end} ${b.y-3}`;y=(a.y+a.h+b.y)/2;}
      else {const start=a.x+a.w/2,end=b.x+b.w/2,top=13;d=`M${start} ${a.y-2} L${start} ${top+7} Q${start} ${top} ${start+7} ${top} L${end-7} ${top} Q${end} ${top} ${end} ${top+7} L${end} ${b.y-3}`;x=(start+end)/2;y=8;}
      byId(`arch-edge-${id}`).setAttribute('d',d);const label=byId(`arch-label-${id}`);
      label.setAttribute('x',shape==='down'?x+8:x);label.setAttribute('y',y);label.setAttribute('text-anchor',shape==='down'?'start':'middle');
    });
    renderPacket();
  }
  const mapObservers=new ResizeObserver(()=>{if(active())drawLines();});mapObservers.observe(byId('architecture-runtime'));
  const originalBadge=document.querySelector('.simulation-badge').innerHTML;
  const traceText=byId('tab-trace').firstChild;
  const heroText=document.querySelector('.hero-description').firstChild, savedHeroText=heroText.textContent;
  function applyMode(on){
    document.body.classList.toggle('architecture-story',on);host.hidden=!on;
    traceText.textContent=on?'Tour outline':'Request log';
    heroText.textContent=on?'Explore the components, interfaces, and deployment lifecycle. Click a block or follow the architecture tour.':savedHeroText;
    document.querySelector('.simulation-badge').innerHTML=on?'<span class="tiny-dot"></span>Architecture overview - no scenario':originalBadge;
    if(on)requestAnimationFrame(drawLines);
  }
  makeSteps = function(s){return s.architecture?stages:original.makeSteps(s);};
  loadScenario = function(key){
    if(!SCENARIOS[key])return;
    original.loadScenario(key);applyMode(key==='architecture');
    if(active())announce('Overall Agent Fabric architecture selected. No business scenario. Ready for the architecture tour.');
  };
  function stageHtml(s,number){
    return `<div class="panel-symbol">${icon(s.icon)}</div><div class="panel-kicker">${esc(s.tag)}</div><h2>${esc(s.title)}</h2><p class="panel-copy">${esc(state.technical?s.technical:s.simple)}</p><div class="panel-example"><span class="small-label">Key distinction</span><p>${esc(s.distinction)}</p></div>${state.technical?`<details class="arch-checks"><summary>What to check in the platform</summary><ul>${s.checks.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></details>`:''}<div class="panel-takeaway"><b>The takeaway</b>${esc(s.takeaway)}</div><div class="arch-sources">${link(s.source)}${s.extra?`<br>${sourceLink(s.extra,'Related documentation')}`:''}</div>`;
  }
  renderExplanation = function(animate=true){
    if(!active())return original.renderExplanation(animate);
    const el=byId('explanation');
    el.innerHTML=state.index?stageHtml(stages[state.index-1],state.index):`<div class="panel-symbol">${icon('fabric')}</div><div class="panel-kicker">Architecture, not a scenario</div><h2>See how the<br>pieces fit.</h2><p class="panel-copy">Explore the components and their relationships without an order, employee, or weather example.</p><div class="panel-example"><span class="small-label">Three layers</span><p>Manage the ecosystem.<br>Understand runtime interactions.<br>Build, deploy, and operate.</p></div><div class="panel-takeaway"><b>Choose your pace</b>Click any block to explain it, use Next, or play all 12 chapters. Technical mode adds architecture details.</div><button class="panel-link" data-arch-play="true">Start the architecture tour ${icon('play')}</button>`;
    if(animate&&!state.reduced){el.classList.remove('reveal');void el.offsetWidth;el.classList.add('reveal');}
  };
  renderGraph = function(){
    if(!active())return original.renderGraph();
    const s=stages[state.index-1],selected=s?s.nodes:[];
    host.querySelectorAll('[data-arch-node]').forEach(el=>{const on=selected.includes(el.dataset.archNode);el.classList.toggle('is-active',on);el.setAttribute('aria-pressed',String(on));});
    edges.forEach(([id])=>byId(`arch-edge-${id}`).classList.toggle('is-active',Boolean(s&&s.motions.some(r=>r[0]===id))));
    byId('architecture-packet').style.display='none';renderPacket();
  };
  renderPacket = function(){
    if(!active())return original.renderPacket();
    const s=stages[state.index-1],packet=byId('architecture-packet');
    if(!s||!s.motions.length){packet.style.display='none';return;}
    const p=Math.min(state.elapsed/duration(),.99999),pos=(state.reduced?.5:p)*s.motions.length;
    const [id,reverse]=s.motions[Math.min(Math.floor(pos),s.motions.length-1)],path=byId(`arch-edge-${id}`);
    if(!path.getAttribute('d'))return;
    const t=state.reduced?.5:pos-Math.floor(pos),point=path.getPointAtLength(path.getTotalLength()*(reverse?1-t:t));
    packet.setAttribute('transform',`translate(${point.x} ${point.y})`);packet.style.display='';
    packet.style.color=id==='delegate'?'var(--blue)':['toolCall','backend','directTool'].includes(id)?'var(--mint)':'var(--purple)';
    const scroll=byId('architecture-scroll');
    if(state.playing&&!state.reduced&&scroll.scrollWidth>scroll.clientWidth+2){const x=point.x+byId('architecture-runtime').offsetLeft,desired=Math.max(0,Math.min(scroll.scrollWidth-scroll.clientWidth,x-scroll.clientWidth/2));scroll.scrollLeft+=(desired-scroll.scrollLeft)*.1;}
  };
  renderControls = function(){
    original.renderControls();if(!active())return;
    const done=state.finished&&state.index===stages.length,label=state.playing?'Pause tour':done?'Replay tour':state.index?'Continue tour':'Play architecture';
    byId('play-btn').innerHTML=icon(state.playing?'pause':done?'reset':'play')+`<span>${label}</span>`;
    byId('play-btn').setAttribute('aria-label',label);byId('current-step').textContent=state.index?stages[state.index-1].title:'Architecture tour - choose any component';
    byId('architecture-status').textContent=state.index?`${done?'Tour complete':state.playing?'Exploring':'Paused'}: ${stages[state.index-1].title}`:'Click a component, or play the architecture tour.';
  };
  renderTrace = function(){
    if(!active())return original.renderTrace();
    byId('trace-panel').innerHTML=`<h3>The architecture tour.</h3><p class="trace-note">Choose a chapter. This is a learning outline, not a request log or a runtime trace.</p><div class="arch-outline">${stages.map((s,i)=>`<button data-arch-step="${i+1}" ${state.index===i+1?'aria-current="step"':''}><span>${String(i+1).padStart(2,'0')}</span><strong>${esc(s.title)}</strong>${icon(state.index>i?'check':'chevron')}</button>`).join('')}</div>`;
    byId('log-count').textContent=state.index;
  };
  const componentSteps={fabric:1,registry:2,scanners:2,build:3,instances:4,user:5,gateway:5,broker:6,llm:7,costs:7,modelProxy:7,agent:8,a2a:8,mcp:9,bridges:9,systems:9,governance:10,visualizer:11};
  selectComponent = function(key,nodeId){
    if(active()&&componentSteps[key]){goStep(componentSteps[key]);return;}
    return original.selectComponent(key,nodeId);
  };
  openModal = function(type,key){
    if(active()&&(type==='intro'||(type==='detail'&&componentSteps[key]))){
      pause();const s=stages[type==='intro'?0:componentSteps[key]-1];
      byId('modal-title').textContent='Architecture essentials';
      byId('modal-body').innerHTML=`<div class="eyebrow">${esc(s.tag)}</div><h2>${esc(s.title)}</h2><p>${esc(s.simple)}</p><p>${esc(s.technical)}</p><div class="detail-note">${esc(s.distinction)}</div><p><strong>${esc(s.takeaway)}</strong></p><div class="modal-actions"><button class="secondary-btn" id="intro-play">Continue the architecture tour ${icon('play')}</button>${link(s.source)}</div>`;
      if(!byId('modal').open)byId('modal').showModal();byId('modal').scrollTop=0;return;
    }
    original.openModal(type,key);
    if(type==='sources')byId('modal-body').insertAdjacentHTML('afterbegin','<p class="arch-source-date">Architecture additions checked against official documentation on 12 November 2026. The overview is a logical teaching map, not a deployment detector.</p>');
    if(active()&&type==='help'){
      byId('modal-body').querySelector('p').textContent='Select Overall Agent Fabric architecture to explore the platform without a business example. Click a block or use the Tour outline to jump to a chapter. Play, pause, previous/next, speed, and keyboard controls work as usual. Technical mode explains interfaces, instances, and model proxies.';
    }
  };
  document.addEventListener('click',event=>{
    const step=event.target.closest('[data-arch-step]');
    if(step){goStep(Number(step.dataset.archStep));requestAnimationFrame(drawLines);return;}
    if(event.target.closest('[data-arch-play]'))play();
  });
  const query=new URLSearchParams(location.search);
  if(query.get('story')==='architecture'||location.hash==='#architecture')loadScenario('architecture');
})();
