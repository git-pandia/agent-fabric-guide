'use strict';
/* Weather teaching module. No HTTP calls, keys, live data, or inferred POC topology.
   Loaded after app.js; delegates existing stories to the original renderers. */
(() => {
  const cfg = {city:'Bengaluru', units:'celsius', result:'success', broker:'Agent Broker', agent:'Weather agent', server:'Weather tools', tool:'get_weather', provider:'Weather API'};
  const fixtures = {
    bengaluru:[24,'partly cloudy',62,12], bangalore:[24,'partly cloudy',62,12],
    mumbai:[29,'cloudy',76,16], delhi:[26,'clear',48,9],
    london:[14,'light rain',81,18], 'new york':[18,'clear',55,14], sydney:[22,'sunny',59,15]
  };
  const originals = {makeSteps, loadScenario, updateNodeLabels, renderExplanation, openModal, selectComponent, edgeColor, renderTrace};
  const json = value => JSON.stringify(value, null, 2);
  const isWeather = () => state.scenario === 'weather';
  edgeColor = function(id) {return id==='weatherApi'?'#26877b':originals.edgeColor(id);};
  const notice = 'Fictional sample data. No weather provider or POC is connected.';
  const $w = id => document.getElementById(id);
  const escapeAttr = value => esc(value);

  // A dedicated provider node distinguishes the MCP interface from its backing API.
  COMPONENTS.weatherApi = {
    title:'Weather service / API', category:'connect', icon:'cloud', tag:'The source of weather facts',
    short:'A weather provider behind the tool, not another AI agent.',
    simple:'The weather tool asks a provider for a location-specific observation. The tool returns that data; the language model explains it.',
    technical:'In this reference design, an MCP tool implementation makes an HTTPS call to a weather provider. Provider authentication, location resolution, response validation, errors, and units belong in that integration.',
    example:'get_weather accepts a city and units, then returns a structured observation or an explicit error.',
    value:'Keep weather facts grounded in retrieved data rather than model memory.',
    note:'The guide uses fictional fixtures, not current conditions. The provider, tool name, and topology must be checked against your own POC.',
    source:'mcp', map:'weatherApi'
  };
  $w('scenario-select').add(new Option('Ask a weather agent', 'weather'));
  document.querySelector('.demo-toolbar').insertAdjacentHTML('afterend', `
    <section id="weather-controls" class="weather-controls" aria-label="Weather example settings" hidden>
      <form id="weather-form" class="weather-form" novalidate>
        <label class="weather-location"><span class="small-label">Which city?</span><input id="weather-city" name="city" value="Bengaluru" placeholder="City, e.g. Bengaluru" list="weather-cities" maxlength="60" required autocomplete="off" aria-describedby="weather-disclaimer weather-error"></label>
        <datalist id="weather-cities"><option value="Bengaluru"><option value="Mumbai"><option value="Delhi"><option value="London"><option value="New York"><option value="Sydney"></datalist>
        <label class="weather-units"><span class="small-label">Temperature</span><select id="weather-units" name="units"><option value="celsius">Celsius (&deg;C)</option><option value="fahrenheit">Fahrenheit (&deg;F)</option></select></label>
        <button class="play-btn weather-run" type="submit">${icon('play')}<span>Ask &amp; follow</span></button>
        <button class="secondary-btn weather-map-btn" type="button" data-modal="weatherMapping">${icon('link')}Match my POC</button>
      </form>
      <div class="weather-disclaimer" id="weather-disclaimer"><span class="weather-sample-tag">SAMPLE DATA</span><p>${notice} The selected city labels a fictional fixture; this is not a place-name lookup.</p></div>
      <p id="weather-error" class="weather-error" role="alert" hidden></p>
    </section>`);

  const graph = $w('graph');
  graph.insertAdjacentHTML('beforeend', `<button class="node node-tool weather-provider" id="node-weatherApi" data-component="weatherApi" style="left:842px;top:247px;width:140px;height:49px" hidden><span class="node-label" id="weather-provider-label">Weather API</span><span class="node-desc">External data source</span></button><p id="weather-graph-note" class="weather-graph-note" hidden>Reference path &middot; One specialist &middot; Read-only lookup &middot; Sample data</p>`);
  const ns = 'http://www.w3.org/2000/svg';
  for (const [id, cls, parent] of [['edge-weatherApi','edge',document.querySelector('.graph-svg')], ['trace-weatherApi','edge-trace',$w('traces')]]) {
    const path = document.createElementNS(ns, 'path');
    path.id = id; path.setAttribute('d','M912 219 L912 247'); path.setAttribute('class',cls);
    if (cls === 'edge') {path.setAttribute('marker-end','url(#arrow-neutral)'); parent.insertBefore(path,$w('traces'));}
    else {path.style.stroke = edgeColor('weatherApi'); parent.appendChild(path);}
    path.style.display = 'none';
  }
  const apiLabel = document.createElementNS(ns,'text');
  apiLabel.id='weather-api-protocol'; apiLabel.setAttribute('class','edge-label tech-label');
  apiLabel.setAttribute('x','923'); apiLabel.setAttribute('y','236'); apiLabel.textContent='HTTPS';
  apiLabel.style.display='none'; document.querySelector('.graph-svg').appendChild(apiLabel);
  const techLabels = [...document.querySelectorAll('.graph-svg > text:not(#weather-api-protocol)')];
  const changedNodes = ['node-agentA','node-toolA','shield-agentA','shield-toolA'];
  const styleBefore = Object.fromEntries(changedNodes.map(id=>[id,$w(id).getAttribute('style')]));
  const labelBefore = techLabels.map(el=>({x:el.getAttribute('x'), y:el.getAttribute('y'), style:el.getAttribute('style')}));
  const edgeBefore = Object.fromEntries(['agentA','toolA'].map(id=>[id,$w(`edge-${id}`).getAttribute('d')]));
  const hideInWeather = ['node-agentB','node-toolB','systemA-label','systemB-label','shield-agentB','shield-toolB','edge-agentB','edge-toolB','trace-agentB','trace-toolB'];

  function setGraphLayout(on) {
    document.body.classList.toggle('weather-story', on);
    $w('weather-controls').hidden=!on;
    $w('node-weatherApi').hidden=!on;
    $w('weather-graph-note').hidden=!on;
    ['edge-weatherApi','trace-weatherApi','weather-api-protocol'].forEach(id=>$w(id).style.display=on?'':'none');
    hideInWeather.forEach(id=>$w(id).style.display=on?'none':'');
    if (on) {
      $w('node-agentA').style.top='129px'; $w('node-toolA').style.top='134px';
      $w('shield-agentA').style.left='566px'; $w('shield-agentA').style.top='165px';
      $w('shield-toolA').style.top='165px';
      for (const [id,d] of [['agentA','M529 174 L617 174'],['toolA','M787 174 L842 174']]) {
        $w(`edge-${id}`).setAttribute('d',d); $w(`trace-${id}`).setAttribute('d',d);
      }
      techLabels[2].setAttribute('x','570'); techLabels[2].setAttribute('y','155');
      techLabels[4].setAttribute('y','155');
      techLabels[3].style.display='none'; techLabels[5].style.display='none';
    } else {
      changedNodes.forEach(id=>$w(id).setAttribute('style',styleBefore[id]));
      for (const [id,d] of Object.entries(edgeBefore)) {$w(`edge-${id}`).setAttribute('d',d); $w(`trace-${id}`).setAttribute('d',d);}
      techLabels.forEach((el,i)=>{el.setAttribute('x',labelBefore[i].x);el.setAttribute('y',labelBefore[i].y);if(labelBefore[i].style===null)el.removeAttribute('style');else el.setAttribute('style',labelBefore[i].style);});
    }
    requestAnimationFrame(resizeGraph);
  }

  function scenario() {
    const [tempC,condition,humidity,wind] = fixtures[cfg.city.toLowerCase()] || [24,'partly cloudy',62,12];
    const temp = cfg.units==='fahrenheit'?Math.round((tempC*9/5+32)*10)/10:tempC;
    const unit = cfg.units==='fahrenheit'?'\u00b0F':'\u00b0C';
    const success = cfg.result==='success';
    const error = cfg.result==='not_found'?'LOCATION_NOT_FOUND':'PROVIDER_UNAVAILABLE';
    const response = success ? {
      status:'ok', city:cfg.city, temperature:temp, unit, condition, humidity_percent:humidity, wind_kph:wind,
      source:'fictional demo fixture', observed_at:null, live:false
    } : {status:'error', code:error, city:cfg.city, source:'simulated error', observation:null, live:false};
    const outcome = success ? `Sample weather for ${cfg.city}: ${temp} ${unit} and ${condition}. Humidity: ${humidity}%; wind: ${wind} km/h. This is fictional sample data, not current weather.` :
      cfg.result==='not_found' ? `In this simulated result, the provider could not resolve "${cfg.city}". Please add a country or region and try again. No weather observation was returned.` :
      `In this simulated result, the weather service is unavailable for ${cfg.city}. Please try again later. I do not have a verified weather observation to report.`;
    return {
      title:'Ask a weather agent', icon:'cloud', request:`What is the weather in ${cfg.city}?`, requestLabel:'Your city-weather request', user:'You',
      agentA:cfg.agent, agentADesc:'Answer a weather question', agentB:'Not needed', agentBDesc:'Single-specialist story',
      toolA:cfg.server, toolADesc:'Look up city weather', toolB:'Not needed', toolBDesc:'No write operation',
      systemA:'Connected to a weather provider', systemB:'', readTool:cfg.tool, writeTool:'not_invoked',
      firstJob:`Find weather for ${cfg.city}`, secondJob:'Not needed', noun:'city weather',
      context:`city: ${JSON.stringify(cfg.city)}`, readResult:outcome, actionResult:'No write operation is needed.', outcome,
      weather:{...cfg,success,response,unit,temp,condition}
    };
  }

  function weatherSteps(s) {
    const w=s.weather, args={city:w.city,units:w.units}, result=w.response;
    const spec=(title,tag,component,ico,nodes,routes,simple,technical,example,value,payload,log)=>({title,tag,component,icon:ico,nodes,routes,simple,technical,example,value,payload:json(payload),log});
    return [
      spec('Ask about a city','01 / Request','user','user',['user','gateway'],[route('request')],
        `You ask for weather in ${w.city}. The application passes your question and the selected units to the protected network entry point.`,
        'The reference path sends a task to a gateway-fronted broker endpoint. The displayed object is a teaching payload, not the A2A wire format. Validate the actual contract in your POC.',
        s.request,'Start with the user intent, not a list of system calls.',{request:s.request,units:w.units,demo:true},`A sample request asks about ${w.city}.`),
      spec('Check access to the network','02 / Govern','gateway','shield',['gateway','broker'],[route('authorize')],
        'The gateway applies the entry rules configured for this example. Being allowed to ask a question does not automatically grant access to every tool.',
        'This reference path assumes protected ingress and configured downstream policy boundaries. Verify authentication, caller context, and actual routed endpoints in your POC; the guide does not enforce real policies.',
        'Illustrative entry check: allowed. Weather-tool permissions are checked separately.','Keep permission decisions outside the language model.',{entry_check:'allowed',weather_tool:'read-only; separately authorized',policy_checks:'simulated'},'The simulated entry check allows the task.'),
      spec('Understand the weather request','03 / Interpret','broker','spark',['broker','llm'],[route('model'),route('model',true)],
        `The broker identifies a weather question about ${w.city} and selects the configured weather specialist. The model is not the source of current weather.`,
        'An illustrative model-backed step extracts intent and location. The configured broker workflow constrains delegation. Real location disambiguation, model calls, and graph nodes depend on your implementation.',
        `Intent: city weather. City: ${w.city}. Units: ${w.units}.`,'Use language intelligence to interpret the question, not invent the answer.',{intent:'weather_lookup',...args,next_agent:w.agent},'The broker selects the weather route in this authored example.'),
      spec('Delegate to the weather agent','04 / A2A','agent','agent',['broker','agentA'],[route('agentA')],
        `The broker asks ${w.agent} to find the weather for ${w.city}. One focused specialist is enough; there is no second-agent handoff.`,
        'This reference design uses an A2A task handoff from the broker to a separate weather agent. A broker calling an MCP tool directly is a different topology; do not claim a separate agent hop unless your POC has one.',
        `${w.agent}: find a weather observation for ${w.city}.`,'A2A delegates a task to an agent.',{protocol:'A2A',from:w.broker,to:w.agent,task:`Find weather for ${w.city}`},`The task is delegated to ${w.agent}.`),
      spec('Call the weather tool','05 / MCP','mcp','tool',['agentA','toolA'],[route('toolA')],
        `The weather agent calls the permitted ${w.tool} tool with the city and units. A tool is a specific operation, not another reasoning agent.`,
        'The agent acts as an MCP client. It invokes a tool exposed by the weather MCP server. Use the actual discovered tool name and input schema from your POC; the example arguments are illustrative.',
        `${w.tool}(${w.city}, ${w.units})`,'MCP connects the agent to a well-defined capability.',{protocol:'MCP',server:w.server,tool:w.tool,arguments:args},`${w.agent} calls the illustrative ${w.tool} operation.`),
      spec(w.success?'Get facts from the weather service':'Handle the provider result','06 / Fetch','weatherApi','cloud',['toolA','weatherApi'],[route('weatherApi'),route('weatherApi',true)],
        w.success?'The tool implementation requests a weather observation from the provider. Here we use a fictional fixture; a real POC would return the provider\'s data.':'The provider returns an unsuccessful result in this simulation. The tool carries that result forward without filling missing weather fields with guessed values.',
        'The MCP server implementation calls its backing weather API over HTTPS in this reference design. This API leg is not MCP or A2A. Validate location, units, timestamps, provider errors, and the response schema. Keep provider credentials on the server.',
        w.success?`${w.city}: ${w.temp} ${w.unit}, ${w.condition}. Fictional fixture; no observation timestamp.`:s.outcome,
        w.success?'The provider supplies weather facts. The model explains them.':'A failed lookup is not a weather observation.',result,w.success?'A fictional weather fixture is returned. No provider was contacted.':`A simulated ${result.code} result is returned.`),
      spec(w.success?'Return the weather findings':'Return the explicit error','07 / Return','agent','agent',['toolA','agentA','broker'],[route('toolA',true),route('agentA',true)],
        w.success?'The tool result returns to the weather agent over MCP. The agent then returns its findings to the broker over A2A, keeping the source and units attached.':'The tool returns the error to the agent, which reports it to the broker. No other agent is called to bypass the failure, and no weather reading is invented.',
        'Two distinct return legs: MCP tool result to the agent, then A2A task result to the broker. Preserve success/error status, city, units, and provenance. Do not conflate the tool response with a second agent call.',
        w.success?'MCP result -> weather agent -> A2A result -> broker.':`Explicit result: ${result.code}. Observation: none.`,'Carry evidence and error states all the way back.',{from:w.agent,to:w.broker,result},w.success?'The broker receives the weather findings through the specialist.':'The broker receives the explicit lookup error.'),
      spec(w.success?'Compose a grounded answer':'Explain what could not be fetched','08 / Compose','broker','spark',['broker','llm'],[route('model'),route('model',true)],
        w.success?'The broker turns the returned data into one readable answer. It preserves the city, units, and the fact that this example is simulated.':'The broker explains the failure and suggests an appropriate next step. It must not substitute a confident-sounding forecast for missing data.',
        'This teaching sequence shows a response-generation model call. In your POC this may occur inside the weather agent or be deterministic formatting. Match the real trace rather than assuming this exact number of LLM calls.',
        s.outcome,'A fluent answer should still be an honest answer.',{response_basis:w.success?'returned tool data':'explicit tool error',response:s.outcome,live:false},'A readable response is composed from the returned result.'),
      spec('Deliver the city-weather response','09 / Respond','user','check',['broker','gateway','user'],[route('authorize',true),route('request',true)],
        'The application returns one answer to the person who asked. All of the internal handoffs stay behind the scenes, while the response still makes its limitations clear.',
        'The response returns through the configured broker endpoint. For a live POC, compare the city, units, provider observation time, and success/error state against the actual tool response. This page remains an offline simulation.',
        s.outcome,'One question. One understandable, evidence-based response.',{request_status:'responded',response:s.outcome,live:false},'The final simulated response is returned to the user.'),
      spec('Compare with your real network','10 / Observe','visualizer','eye',['gateway','broker','llm','agentA','toolA','weatherApi'],[],
        'The weather journey is complete. Use Match my POC to compare component names and responsibilities with your actual network. The guide does not inspect or call that network.',
        'Compare your configured graph and runtime evidence: entry, A2A delegation, MCP invocation, provider response, and final output. Registry and visualizer are management capabilities, not extra request hops. This request log contains authored events only.',
        s.outcome,'One specialist. One read-only lookup. Verify the real path in your POC.',{source:'authored walkthrough',live_connections:0,measured_latency:null,poc_topology_verified:false},'The weather walkthrough is complete. Compare these stages with real POC evidence.')
    ];
  }

  function weatherComponentOverrides() {
    const s=SCENARIOS.weather;
    return {
      broker:{...COMPONENTS.broker,title:cfg.broker,example:`Coordinate a weather lookup for ${cfg.city}, then return the specialist's result.`},
      agent:{...COMPONENTS.agent,title:cfg.agent,example:`Handle the weather task and invoke ${cfg.tool}; return the result to the broker.`,note:'This is a reference A2A specialist, not a prebuilt MuleSoft weather agent. Confirm that your POC has this separate agent.'},
      mcp:{...COMPONENTS.mcp,title:cfg.server,example:`Expose ${cfg.tool} with a city and units; return a weather observation or explicit error.`,note:'The MCP interface and the backing HTTPS provider are separate. Tool names and input schemas must match your POC.'},
      user:{...COMPONENTS.user,example:s.request},
      weatherApi:{...COMPONENTS.weatherApi,title:cfg.provider,example:s.outcome},
      llm:{...COMPONENTS.llm,example:`Interpret a question about ${cfg.city} or format the returned weather result. Never use model memory as current conditions.`}
    };
  }
  function withWeatherComponents(callback) {
    if(!isWeather()) return callback();
    const overrides=weatherComponentOverrides(), saved={};
    for(const key of Object.keys(overrides)){saved[key]=COMPONENTS[key];COMPONENTS[key]=overrides[key];}
    try{return callback();}finally{Object.assign(COMPONENTS,saved);}
  }

  makeSteps = function(s) {return s.weather?weatherSteps(s):originals.makeSteps(s);};
  loadScenario = function(key) {
    if(!SCENARIOS[key]) return;
    setGraphLayout(key==='weather');
    originals.loadScenario(key);
  };
  const brokerLabel=$w('node-broker').querySelector('.node-label');
  const brokerDesc=$w('node-broker').querySelector('.node-desc');
  const originalBroker={label:brokerLabel.textContent,desc:brokerDesc.textContent};
  updateNodeLabels = function() {
    originals.updateNodeLabels();
    brokerLabel.textContent=isWeather()?cfg.broker:originalBroker.label;
    brokerDesc.textContent=isWeather()?'Coordinate the weather task':originalBroker.desc;
    $w('node-broker').setAttribute('aria-label',`${brokerLabel.textContent}: explore`);
    $w('weather-provider-label').textContent=cfg.provider;
    $w('node-toolA').title=isWeather()?cfg.tool:'';
    $w('weather-disclaimer').querySelector('p').textContent=notice + (cfg.result==='success'?' The selected city labels a fictional fixture, not a verified location.':cfg.result==='not_found'?' Outcome selected: simulated location not found.':' Outcome selected: simulated provider unavailable.');
    $w('node-weatherApi').setAttribute('aria-label',`${cfg.provider}, backing weather service: explore`);
  };
  renderExplanation = function(animate=true) {
    withWeatherComponents(()=>originals.renderExplanation(animate));
    if(isWeather() && state.index===10 && !state.selected){
      const link=$w('explanation').querySelector('.panel-link');
      link.removeAttribute('data-detail');link.dataset.modal='weatherMapping';link.innerHTML=`Match my POC ${icon('arrow')}`;
    }
    if(isWeather() && !state.index && !state.selected){
      $w('explanation').innerHTML=`<div class="panel-symbol">${icon('cloud')}</div><div class="panel-kicker">Your weather POC, explained</div><h2>One city.<br>One clear answer.</h2><p class="panel-copy">Follow one request through a broker, a weather agent, an MCP tool, and its provider.</p><div class="panel-example"><span class="small-label">The reference path</span><p>Interpret the question.<br>Fetch the facts.<br>Return a grounded answer.</p></div><div class="panel-takeaway"><b>Sample data, not a live forecast</b>Choose a city and select Ask &amp; follow. This is a reference path, not a live connection.</div><button class="panel-link" data-modal="weatherMapping">Match my POC ${icon('arrow')}</button>`;
    }
  };
  renderTrace = function() {
    originals.renderTrace();
    if(isWeather() && state.technical) $$('#trace-panel .trace-item code').forEach((el,i)=>{
      const p=JSON.parse(steps[i].payload);
      el.textContent=[p.protocol,p.tool,p.city,p.status,p.code,p.request_status,p.source].filter(Boolean).join(' / ') || steps[i].tag;
    });
  };
  selectComponent = function(key,node) {
    if(key==='weatherApi' && !isWeather()) loadScenario('weather');
    return originals.selectComponent(key,node);
  };

  const fields=[['broker','Broker display name',28],['agent','Weather agent display name',28],['server','MCP server display name',22],['tool','MCP tool name',64],['provider','Weather provider display name',22]];
  function mappingHtml() {
    const rows=[
      ['Your question','The client/UI that submits a city and units. Compare request and response fields.'],
      ['Gateway + policies','Verify the actual protected endpoints and policies. Shield icons do not prove coverage.'],
      [cfg.broker,'Match the broker asset and routing instructions/graph. A simple direct agent POC may not have a broker.'],
      [cfg.agent,'Confirm a separate A2A agent, its advertised skills, and the actual delegation trace.'],
      [cfg.server+' / '+cfg.tool,'Compare the discovered MCP tool name, arguments, units, and returned schema.'],
      [cfg.provider,'Compare the server-side provider call, location resolution, observation time, and error handling.'],
      ['Language model','Check where interpretation and formatting occur. The two model calls here are illustrative.'],
      ['Registry + Visualizer','Use registered assets and available monitoring to inspect the network, not as extra business-request hops.']
    ];
    return `<div class="eyebrow">Reference design, not a detected network</div><h2>Put your POC beside the story.</h2><p>Compare <strong>broker &rarr; weather agent (A2A) &rarr; weather tool (MCP) &rarr; provider (HTTPS)</strong> with your actual implementation. Only the labels below are editable; changing a label does not change or connect the topology.</p><div class="detail-note">Your network may differ: a broker can call an MCP tool directly, or an agent can call a weather API without MCP. Do not claim those extra hops exist. Match the real configuration and trace before using this as an exact architecture diagram.</div><form id="weather-map-form" novalidate><div class="weather-map-fields">${fields.map(([key,label,max])=>`<label><span>${label}</span><input name="${key}" value="${escapeAttr(cfg[key])}" maxlength="${max}" required autocomplete="off"></label>`).join('')}<label><span>Simulated provider outcome</span><select name="result"><option value="success" ${cfg.result==='success'?'selected':''}>Weather returned</option><option value="not_found" ${cfg.result==='not_found'?'selected':''}>Location not found</option><option value="unavailable" ${cfg.result==='unavailable'?'selected':''}>Provider unavailable</option></select></label></div><p class="weather-privacy">Labels stay in this page session only. Do not enter URLs, tokens, API keys, or customer data. No network connection is made.</p><p id="weather-map-error" class="weather-error" role="alert" hidden></p><div class="modal-actions"><button type="submit" class="secondary-btn">Apply labels &amp; reset story ${icon('check')}</button></div></form><h3 class="weather-compare-title">What to compare</h3><div class="weather-compare">${rows.map(([a,b])=>`<div><strong>${esc(a)}</strong><p>${esc(b)}</p></div>`).join('')}</div><p class="weather-source-note">For current Agent Network projects, inspect <code>agent-network.yaml</code>, <code>exchange.json</code>, and broker <code>.agent</code> files where applicable. Earlier POCs can use a different configuration format.</p>${sourceLink('network','Agent network concepts')}<br>${sourceLink('define','Network configuration reference')}<br>${sourceLink('mcp','MCP connector reference')}`;
  }
  openModal = function(type,key) {
    if(type!=='weatherMapping') return withWeatherComponents(()=>originals.openModal(type,key));
    pause(); $w('modal-title').textContent='Match the weather story to your POC';
    $w('modal-body').innerHTML=mappingHtml();
    if(!$w('modal').open)$w('modal').showModal();
    $w('modal').scrollTop=0;
  };

  function validateCity(value) {
    const city=value.trim().replace(/\s+/g,' ');
    if(!city || city.length>60 || !/[\p{L}]/u.test(city) || !/^[\p{L}\p{M}\p{N} .,'()\u2019-]+$/u.test(city)) return null;
    return city;
  }
  function restartWeather(start) {
    SCENARIOS.weather=scenario(); loadScenario('weather');
    if(start)play();
  }
  $w('weather-form').addEventListener('submit',event=>{
    event.preventDefault(); const city=validateCity($w('weather-city').value);
    $w('weather-error').hidden=Boolean(city); $w('weather-city').setAttribute('aria-invalid',String(!city));
    if(!city){$w('weather-error').textContent='Enter a city name (up to 60 characters), for example Bengaluru or London, UK.';$w('weather-city').focus();return;}
    cfg.city=city;cfg.units=$w('weather-units').value;$w('weather-city').value=city;
    restartWeather(true);
  });
  // Editing inputs pauses playback so the visible request never changes mid-journey.
  $w('weather-city').addEventListener('input',()=>{if(state.playing)pause();$w('weather-error').hidden=true;$w('weather-city').removeAttribute('aria-invalid');});
  $w('weather-units').addEventListener('change',()=>{if(state.playing)pause();});
  document.addEventListener('submit',event=>{
    if(event.target.id!=='weather-map-form')return;
    event.preventDefault();const data=new FormData(event.target), values={};
    for(const [key,,max] of fields){
      const value=String(data.get(key)||'').trim();
      const valid=key==='tool'?/^[A-Za-z_][A-Za-z0-9_.-]*$/.test(value):/^[\p{L}\p{M}\p{N} _().-]+$/u.test(value);
      if(!value || value.length>max || !valid){$w('weather-map-error').hidden=false;$w('weather-map-error').textContent=key==='tool'?'Use a tool identifier with letters, numbers, underscores, dots, or hyphens.':'Use short display names with letters, numbers, spaces, hyphens, or underscores; no credentials or URLs.';event.target.elements[key].focus();return;}
      values[key]=value;
    }
    const result=String(data.get('result'));
    if(!['success','not_found','unavailable'].includes(result))return;
    Object.assign(cfg,values,{result});closeModal();restartWeather(false);showToast('POC labels applied to this reference path. No live connection made.');
  });
  FAQS.push(['Does the weather example call my live POC?','No. It uses fictional weather fixtures and explicit simulated error outcomes. Enter a city and choose Ask & follow to see the handoffs. Match my POC changes session-only display labels and provides a comparison checklist; it does not connect to, inspect, or verify your actual network.','network']);
  FAQS.push(['Does a weather POC need all the components shown?','Not necessarily. This example deliberately shows a broker, a separate A2A weather agent, an MCP weather tool, and an HTTPS provider. A direct broker-to-tool path or an agent with a direct API call has fewer hops. Use your actual configuration and runtime evidence to decide what belongs in your architecture.','network']);
  SCENARIOS.weather=scenario();renderFAQ();renderLibrary();
  const query=new URLSearchParams(location.search);
  if(query.get('story')==='weather' || location.hash==='#weather') {
    const city=validateCity(query.get('city')||'');if(city){cfg.city=city;$w('weather-city').value=city;}
    if(query.get('units')==='fahrenheit'){cfg.units='fahrenheit';$w('weather-units').value='fahrenheit';}
    restartWeather(false);
  }
})();
