/* Paquete estático generado desde src/game/. No requiere React/Vite en Cloudflare. */
const V96_ENGINE_PATCH = "\n // ==================== FUTBOL UNICO v96 ====================\n // Capa reversible: mejora evaluación, planificación y presentación, e incorpora\n // precisión progresiva por distancia, ángulo y calidad individual sin tocar v95.\n const FU_V96_VERSION='96.4.0';\n const FU_V96_PROFILE_KEY='futbolUnico_v96_tactical_identity';\n const FU_V96_HISTORY_KEY='futbolUnico_v96_opponent_history';\n const FU_V96_METRICS_KEY='futbolUnico_v96_metrics';\n\n const fuV95CaptureSequenceState=captureSequenceState;\n const fuV95RestoreSequenceState=restoreSequenceState;\n const fuV95TacticalCandidates=tacticalCandidates;\n const fuV95EvaluateSequencePosition=evaluateSequencePosition;\n const fuV95UpdateAutomaticCpuProfile=updateAutomaticCpuProfile;\n const fuV95BeginManualAction=beginManualAction;\n const fuV95AdvanceSimulatedAction=advanceSimulatedAction;\n const fuV95Finish=finish;\n const fuV95Refresh=refresh;\n const fuV95ConfigureTacticalScenario=typeof configureTacticalScenario==='function'?configureTacticalScenario:null;\n\n const FU_V96_IDENTITIES={\n  defensive:{label:'Defensivo',short:'Cierra carriles y sostiene la ultima linea.',base:'defensive'},\n  balanced:{label:'Equilibrado',short:'Combina estructura, progresion y oportunidad.',base:'balanced'},\n  aggressive:{label:'Agresivo',short:'Presiona y acelera cuando la cobertura lo permite.',base:'aggressive'},\n  cautious:{label:'Cauteloso',short:'Prioriza posesion segura y riesgo bajo.',base:'cautious'},\n  counter:{label:'Contraatacador',short:'Bloque protegido y salida vertical tras recuperar.',base:'defensive'},\n  adaptive:{label:'Adaptativo',short:'Lee marcador, tiempo y patrones recientes del rival.',base:'balanced'}\n };\n let fuV96Identity='adaptive',fuV96ShowThreats=false,fuV96TransitionActions=0,fuV96LastAudit=null;\n let fuV96TournamentIdentity=null,fuV96TournamentOpponentId='',fuV96TournamentOpponentName='';\n let fuV96LastOwnerTeam=owner()?.t||null;\n try{\n  const query=new URLSearchParams(parent.location.search||location.search||'');\n  if(query.get('mode')==='torneo'){\n   fuV96TournamentOpponentId=(query.get('opponent')||'').replace(/[^a-z0-9-]/gi,'').slice(0,80);\n   fuV96TournamentOpponentName=query.get('cpuName')||fuV96TournamentOpponentId||'rival';\n   const assigned=query.get('cpuProfile');\n   if(assigned&&FU_V96_IDENTITIES[assigned]){fuV96TournamentIdentity=assigned;fuV96Identity=assigned;}\n  }\n }catch(_e){}\n if(!fuV96TournamentIdentity){try{const saved=localStorage.getItem(FU_V96_PROFILE_KEY);if(saved&&FU_V96_IDENTITIES[saved])fuV96Identity=saved;}catch(_e){}}\n const fuV96HistoryStoreKey=fuV96TournamentOpponentId?FU_V96_HISTORY_KEY+'_'+fuV96TournamentOpponentId:FU_V96_HISTORY_KEY;\n\n function fuV96LoadJson(key,fallback){try{const value=JSON.parse(localStorage.getItem(key)||'null');return value||fallback;}catch(_e){return fallback;}}\n function fuV96SaveJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(_e){return false;}}\n let fuV96ActionHistory=fuV96LoadJson(fuV96HistoryStoreKey,[]);\n if(!Array.isArray(fuV96ActionHistory))fuV96ActionHistory=[];\n fuV96ActionHistory=fuV96ActionHistory.filter(x=>x&&Number.isInteger(x.team)&&x.kind).slice(-80);\n let fuV96Metrics=fuV96LoadJson(FU_V96_METRICS_KEY,{actions:0,passes:0,shots:0,duels:0,moves:0,repeated:0,byProfile:{}});\n\n\n // ==================== PRECISION PROGRESIVA v96 ====================\n // Curvas de referencia (% de acertar la casilla elegida antes de intercepciones).\n // Ninguna acción tiene precisión garantizada. Los atributos modifican la curva\n // según el número de jugador, tanto en el juego real como en la evaluación de la IA.\n const FU_V96_SHOT_CURVE=[0,90,85,78,68,57,46,35,25,17,11,6];\n const FU_V96_PASS_CURVE=[0,90,85,82,72,60,48,36,25,15];\n const fuV96PlayerGrade=(kind,n)=>kind==='pass'\n  ? (n===10?'excellent':[5,7,8].includes(n)?'good':'regular')\n  : ([9,11].includes(n)?'excellent':[7,8,10].includes(n)?'good':[3,4,5].includes(n)?'regular':'bad');\n // La curva es el techo de un excelente: los otros perfiles bajan desde ese techo,\n // así el límite universal de 90% nunca iguala a excelente y bueno en distancias cortas.\n const fuV96GradeMultiplier={excellent:1.00,good:.95,regular:.90,bad:.70};\n function fuV96ShotAngleFactor(from){\n  const lateral=Math.abs((Number(from?.r)||0)-5);\n  if(lateral<=1)return 1;\n  if(lateral<=3)return .90;\n  return .78;\n }\n function fuV96AccuracyPercent(kind,player,from,to){\n  const distance=cheb(from,to);\n  if(distance<1)return 0;\n  const curve=kind==='shoot'?FU_V96_SHOT_CURVE:FU_V96_PASS_CURVE;\n  const base=curve[Math.min(distance,curve.length-1)]??curve[curve.length-1];\n  const angled=kind==='shoot'?base*fuV96ShotAngleFactor(from):base;\n  const grade=fuV96PlayerGrade(kind,player?.n);\n  return Math.max(2,Math.min(90,angled*(fuV96GradeMultiplier[grade]??.90)));\n }\n function fuV96MaxShotDeviation(distance,grade){\n  let max=distance<=3?1:distance<=6?2:distance<=8?3:distance<=10?4:5;\n  if(grade==='excellent'&&max>1)max--;\n  else if(grade==='regular'&&max>=2)max=Math.min(5,max+1);\n  else if(grade==='bad')max=Math.min(5,max+2);\n  return max;\n }\n function fuV96MaxPassSlip(distance,grade){\n  let max=distance<=2?1:distance<=4?2:distance<=6?3:4;\n  if(grade==='excellent'&&max>1)max--;\n  else if(grade==='regular'&&max>=2)max=Math.min(4,max+1);\n  return max;\n }\n function fuV96MagnitudeWeights(max,distance=1,kind='pass'){\n  const exponent=kind==='shoot'?(distance<=2?-.65:distance<=4?-.1:distance<=6?.45:distance<=8?1.05:1.35):-1.15;\n  const raw=[];let total=0;\n  for(let magnitude=1;magnitude<=max;magnitude++){const weight=Math.pow(magnitude,exponent);raw.push({magnitude,weight});total+=weight;}\n  return raw.map(item=>({...item,weight:item.weight/total}));\n }\n function fuV96ChooseMagnitude(max,distance=1,kind='pass'){\n  const outcomes=fuV96MagnitudeWeights(max,distance,kind),roll=tacticalRandom();let cumulative=0;\n  for(const outcome of outcomes){cumulative+=outcome.weight;if(roll<cumulative)return outcome.magnitude;}\n  return max;\n }\n function fuV96KeeperSaveChance(shooter,from,to,playersState=p){\n  const keeper=playersState.find(z=>z.t!==shooter.t&&z.n===1);if(!keeper)return 0;\n  const distance=cheb(from,to);\n  const base=distance<=2?.20:distance<=4?.32:distance<=6?.55:distance<=7?.80:.94;\n  const lateralGap=Math.abs(keeper.r-to.r);\n  const lateralFactor=lateralGap===0?1:lateralGap===1?.93:lateralGap===2?.72:lateralGap===3?.50:.30;\n  const goalColumn=shooter.t===1?C-1:0,depthGap=Math.abs(goalColumn-keeper.c);\n  const depthFactor=depthGap<=1?1:depthGap===2?.82:.62;\n  return Math.max(0,Math.min(.88,base*lateralFactor*depthFactor));\n }\n function fuV96ShotMissOutcomes(shooter,from,to,missWeight){\n  const distance=cheb(from,to),grade=fuV96PlayerGrade('shoot',shooter?.n);\n  const max=fuV96MaxShotDeviation(distance,grade),weights=fuV96MagnitudeWeights(max,distance,'shoot'),outcomes=[];\n  for(const item of weights){\n   for(const sign of [-1,1]){\n    outcomes.push({c:to.c,r:Math.max(0,Math.min(R-1,to.r+sign*item.magnitude)),weight:missWeight*item.weight/2});\n   }\n  }\n  return outcomes;\n }\n\n // Reemplazos del motor base: estos mismos números los utilizan la ejecución,\n // la estimación del gol, la búsqueda táctica y la CPU.\n estimatedShotAccuracy=function(shooter,from,to){\n  return fuV96AccuracyPercent('shoot',shooter,from,to)/100;\n };\n estimatedPassPrecision=function(passer,from,to){\n  return fuV96AccuracyPercent('pass',passer,from,to)/100;\n };\n precisionChance=function(player,target){\n  return estimatedPassPrecision(player,{c:ball.c,r:ball.r},target);\n };\n shotAccuracyOutcomes=function(shooter,from,to){\n  const accuracy=estimatedShotAccuracy(shooter,from,to);\n  return [{c:to.c,r:to.r,weight:accuracy},...fuV96ShotMissOutcomes(shooter,from,to,1-accuracy)];\n };\n isGoalEndpointForShot=function(shooter,from,cell,playersState=p){\n  if(cell.c<0||cell.c>=C||cell.r<0||cell.r>=R)return false;\n  if(!goalSideForCell(cell.c,cell.r,shooter.t))return false;\n  return !goalkeeperBlocksShot(shooter,from,cell,playersState);\n };\n estimateShotProbability=function(shooter,from,to,playersState=p){\n  const distance=cheb(from,to),accuracy=estimatedShotAccuracy(shooter,from,to);\n  if(distance>BALL_REACH(shooter.n))return {probability:0,accuracy:0,goalChance:0,interceptionRisk:0,blocked:true,rangeBlocked:true,goalkeeperBlocked:false,first:null};\n  const interception=trajectoryInterceptionRisk(from,to,shooter.t,playersState);\n  if(interception.blocked)return {probability:0,accuracy,goalChance:0,interceptionRisk:1,blocked:true,rangeBlocked:false,goalkeeperBlocked:goalkeeperBlocksShot(shooter,from,to,playersState),first:interception.first};\n  let goalChance=0;\n  for(const outcome of shotAccuracyOutcomes(shooter,from,to)){\n   if(!isGoalEndpointForShot(shooter,from,outcome,playersState))continue;\n   goalChance+=outcome.weight*(1-fuV96KeeperSaveChance(shooter,from,outcome,playersState));\n  }\n  goalChance=Math.max(0,Math.min(1,goalChance));\n  const probability=Math.max(0,Math.min(1,goalChance*(1-interception.risk)));\n  const goalkeeperBlocked=goalkeeperBlocksShot(shooter,from,to,playersState);\n  return {probability,accuracy,goalChance,interceptionRisk:interception.risk,blocked:probability<=0,rangeBlocked:false,goalkeeperBlocked,first:interception.first};\n };\n resolveAccuracy=function(player,target){\n  const from={c:ball.c,r:ball.r};\n  const isShot=!!goalSideForCell(target.c,target.r,player.t);\n  const distance=cheb(from,target),grade=fuV96PlayerGrade(isShot?'shoot':'pass',player.n);\n  const accuracy=fuV96AccuracyPercent(isShot?'shoot':'pass',player,from,target)/100;\n  if(tacticalRandom()<accuracy){\n   return {target:{c:target.c,r:target.r},description:(isShot?'Remate':'Pase')+' preciso ('+Math.round(accuracy*100)+'% de precisión base).'};\n  }\n  if(isShot){\n   const max=fuV96MaxShotDeviation(distance,grade),magnitude=fuV96ChooseMagnitude(max,distance,'shoot'),sign=tacticalRandom()<.5?-1:1;\n   return {target:{c:target.c,r:Math.max(0,Math.min(R-1,target.r+sign*magnitude))},description:'Remate desviado lateralmente '+magnitude+' '+(magnitude===1?'casillero':'casilleros')+' (distancia: '+distance+').'};\n  }\n  const max=fuV96MaxPassSlip(distance,grade),magnitude=fuV96ChooseMagnitude(max,distance,'pass'),long=tacticalRandom()>=.5;\n  const path=passPathCells(from,target);\n  let end;\n  if(long){\n   let step;\n   if(path.length>1)step={c:path[path.length-1].c-path[path.length-2].c,r:path[path.length-1].r-path[path.length-2].r};\n   else step={c:Math.sign(target.c-from.c),r:Math.sign(target.r-from.r)};\n   end={c:target.c+step.c*magnitude,r:target.r+step.r*magnitude};\n  }else{\n   const index=path.length-1-magnitude;\n   end=index<0?from:path[index];\n  }\n  return {target:end,description:'Pase fallido: quedó '+(long?'largo':'corto')+' '+magnitude+' '+(magnitude===1?'casillero':'casilleros')+' (distancia: '+distance+').'};\n };\n\n // El estado de falta faltaba en las instantaneas de minimax de v95.\n captureSequenceState=function(){\n  const state=fuV95CaptureSequenceState();\n  state.freeKickRequiredId=freeKickRequiredId;\n  state.freeKickAwardedTeam=freeKickAwardedTeam;\n  state.cpuProfile=cpuProfile;\n  state.fuV96TransitionActions=fuV96TransitionActions;\n  return state;\n };\n restoreSequenceState=function(state){\n  fuV95RestoreSequenceState(state);\n  freeKickRequiredId=state.freeKickRequiredId??null;\n  freeKickAwardedTeam=state.freeKickAwardedTeam??null;\n  cpuProfile=state.cpuProfile||cpuProfile;\n  fuV96TransitionActions=state.fuV96TransitionActions||0;\n };\n advanceSimulatedAction=function(result,playerId){\n  const actingTeam=turn,value=fuV95AdvanceSimulatedAction(result,playerId);\n  if(actingTeam===CPU_TEAM&&fuV96TransitionActions>0)fuV96TransitionActions--;\n  return value;\n };\n\n // Los escenarios no iniciales de v95 heredaban por error la obligacion de saque.\n if(fuV95ConfigureTacticalScenario){\n  configureTacticalScenario=function(scenario,rootTeam){\n   fuV95ConfigureTacticalScenario(scenario,rootTeam);\n   if(scenario&&scenario.id!=='kickoff')kickoffPassRequired=false;\n  };\n }\n\n function fuV96BestShot(shooter,playersState,from){\n  const goalC=shooter.t===1?C-1:0;\n  let best={probability:0,row:5,to:{c:goalC,r:5}};\n  for(let row=4;row<=6;row++){\n   const estimate=estimateShotProbability(shooter,from,{c:goalC,r:row},playersState);\n   if(estimate.probability>best.probability)best={probability:estimate.probability,row,to:{c:goalC,r:row}};\n  }\n  return best;\n }\n\n // Mapa de peligro: remate directo, pase-remate y conduccion-remate. A diferencia\n // del maximo unico de v95 conserva amenazas simultaneas y sus casillas de cierre.\n function fuV96ThreatOptions(playersState=p,carrierId=ball.owner){\n  const carrier=playersState.find(z=>z.id===carrierId);\n  if(!carrier)return [];\n  const from={c:carrier.c,r:carrier.r},goalC=carrier.t===1?C-1:0,options=[];\n  for(let row=4;row<=6;row++){\n   const to={c:goalC,r:row},estimate=estimateShotProbability(carrier,from,to,playersState);\n   options.push({type:'direct',probability:estimate.probability,from,to,path:passPathCells(from,to),playerId:carrier.id,row});\n  }\n  for(const receiver of playersState){\n   if(receiver.t!==carrier.t||receiver.id===carrier.id)continue;\n   const to={c:receiver.c,r:receiver.r};\n   if(cheb(from,to)>BALL_REACH(carrier.n)||stateOffsidePosition(receiver,from,playersState))continue;\n   const precision=estimatedPassPrecision(carrier,from,to);if(precision<=0)continue;\n   const interception=trajectoryInterceptionRisk(from,to,carrier.t,playersState);if(interception.blocked)continue;\n   const shot=fuV96BestShot(receiver,playersState,to);\n   const probability=precision*(1-interception.risk)*shot.probability;\n   if(probability<=0)continue;\n   options.push({type:'pass-shot',probability,from,to:shot.to,receiverId:receiver.id,\n    path:[...passPathCells(from,to),...passPathCells(to,shot.to)],playerId:carrier.id,row:shot.row});\n  }\n  // Un paso con balon puede abrir un remate que el evaluador v95 no anticipaba.\n  for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){\n   if(!dc&&!dr)continue;\n   const cell={c:from.c+dc,r:from.r+dr};\n   if(cell.c<0||cell.c>=C||cell.r<0||cell.r>=R||playersState.some(z=>z.id!==carrier.id&&z.c===cell.c&&z.r===cell.r))continue;\n   const virtual={...carrier,c:cell.c,r:cell.r};\n   const nextState=playersState.map(z=>z.id===carrier.id?virtual:z);\n   const shot=fuV96BestShot(virtual,nextState,cell);\n   const pressure=nextState.filter(z=>z.t!==carrier.t&&cheb(z,cell)<=1).length;\n   const probability=shot.probability*(pressure?Math.max(.42,1-pressure*.22):.82);\n   if(probability<=0)continue;\n   options.push({type:'carry-shot',probability,from,to:shot.to,path:[cell,...passPathCells(cell,shot.to)],playerId:carrier.id,row:shot.row});\n  }\n  return options.sort((a,b)=>b.probability-a.probability).slice(0,8);\n }\n\n function fuV96ThreatIndex(options){\n  return Math.min(1.6,(options[0]?.probability||0)+(options[1]?.probability||0)*.52+(options[2]?.probability||0)*.24);\n }\n function fuV96DistanceToRoute(cell,option){\n  const route=option?.path||[];\n  return route.length?Math.min(...route.map(q=>cheb(cell,q))):99;\n }\n function fuV96CoverageAssignments(team,options,playersState=p){\n  const pool=playersState.filter(z=>z.t===team&&[2,3,4,5,6].includes(z.n)),used=new Set(),assignments=new Map();\n  options.slice(0,3).forEach((option,index)=>{\n   const ranked=pool.filter(z=>!used.has(z.id)).map(z=>({z,cost:fuV96DistanceToRoute(z,option)+(z.n===5?.65:0)})).sort((a,b)=>a.cost-b.cost||a.z.id-b.z.id);\n   if(ranked[0]){assignments.set(index,ranked[0].z.id);used.add(ranked[0].z.id);}\n  });\n  return assignments;\n }\n\n function fuV96AllPressers(team,holder,playersState=p,ignoreId=null,replacement=null){\n  return playersState.filter(z=>z.t===team).map(z=>z.id===ignoreId&&replacement?{...z,c:replacement.c,r:replacement.r}:z).filter(z=>cheb(z,holder)<=2).length;\n }\n\n function fuV96RecentPatternAdjustment(action,team,holder){\n  if(team!==CPU_TEAM||!holder||holder.t!==HUMAN_TEAM||action.kind!=='move')return 0;\n  const recent=fuV96ActionHistory.filter(x=>x.team===HUMAN_TEAM&&['shoot','pass','carry'].includes(x.kind)).slice(-28);\n  let value=0;\n  for(const item of recent){\n   if(!item.from||!item.to)continue;\n   const nearOrigin=cheb(holder,item.from)<=4&&Math.abs(holder.r-item.from.r)<=2;if(!nearOrigin)continue;\n   const route=passPathCells(item.from,item.kind==='shoot'?{c:C-1,r:Math.max(4,Math.min(6,item.to.r))}:item.to);\n   if(!route.length)continue;\n   const before=Math.min(...route.map(q=>cheb(action.player,q))),after=Math.min(...route.map(q=>cheb(action.to,q)));\n   value+=(before-after)*(item.kind==='shoot'?8:4.5);\n  }\n  return Math.max(-24,Math.min(34,value));\n }\n\n function fuV96MovementPurposeAdjustment(action,team,holder){\n  if(team!==CPU_TEAM||!holder||holder.t!==team||!action||!action.player||!action.to)return 0;\n  if(!['move','carry'].includes(action.kind))return 0;\n  const actor=action.player,from={c:actor.c,r:actor.r},to=action.to;\n  const forwardCells=team===1?to.c-from.c:from.c-to.c;\n  const beforeDistance=cheb(from,holder),afterDistance=cheb(to,holder);\n  let value=0,reasons=[];\n  // Una acción que retrocede con posesión necesita una ventaja compensatoria clara.\n  if(forwardCells<0){value-=Math.min(30,17+4*Math.abs(forwardCells));reasons.push('retroceso ofensivo');}\n  // En ataque, los defensores no deben consumir una acción para recolocarse detrás de la pelota\n  // si tampoco se acercan a ofrecer apoyo ni adelantan la línea.\n  if(action.kind==='move'&&[2,3,4,5].includes(actor.n)&&forwardCells<=0&&afterDistance>=beforeDistance){\n   value-=22;reasons.push('reorganización defensiva sin apoyo ni progresión');\n  }\n  // Detecta el regreso inmediato a la casilla de origen del mismo jugador (movimiento ping-pong).\n  const previousReverse=fuV96ActionHistory.slice(-12).reverse().find(item=>\n   item.team===team&&item.playerNo===actor.n&&['move','carry'].includes(item.kind)&&item.from&&item.to&&\n   from.c===item.to.c&&from.r===item.to.r&&to.c===item.from.c&&to.r===item.from.r\n  );\n  if(previousReverse){value-=25;reasons.push('regreso a una posición anterior');}\n  action.fuV96MovementPurposeReason=reasons.join(', ');\n  return Math.max(-55,value);\n }\n\n function fuV96ProfileAdjustment(action,team,holder){\n  if(team!==CPU_TEAM)return 0;\n  const success=actionSuccessEstimate(action),pGoal=Number(action.goalProbability)||0,forward=Number(action.progress)||0;\n  const own=holder&&holder.t===team,defending=holder&&holder.t!==team;\n  let value=0;\n  if(fuV96Identity==='defensive'){\n   if(defending&&action.kind==='move')value+=(action.fuV96ThreatReduction||0)*75+(action.defensiveShapeAdjustment||0)*.38;\n   if(own&&action.kind==='pass')value+=success*8-(action.exposureRisk||0)*.22;\n   if(own&&action.kind==='shoot'&&pGoal<.5)value-=10;\n  }else if(fuV96Identity==='aggressive'){\n   if(defending&&action.kind==='duel')value+=action.duelOutcome==='frente'?15:4;\n   if(defending&&action.kind==='move'&&holder)value+=(cheb(action.player,holder)-cheb(action.to,holder))*6;\n   if(own)value+=Math.max(0,forward)*3+(action.kind==='shoot'?pGoal*12:0);\n  }else if(fuV96Identity==='cautious'){\n   if(own&&action.kind==='pass')value+=success*13-(1-success)*15-(action.exposureRisk||0)*.28;\n   if(own&&action.kind==='carry')value-=nearOpponents(team,action.to,1)*5;\n   if(own&&action.kind==='shoot'&&pGoal<.58)value-=16;\n   if(defending&&action.kind==='move')value+=(action.fuV96ThreatReduction||0)*62;\n  }else if(fuV96Identity==='counter'){\n   if(defending&&action.kind==='move')value+=(action.fuV96ThreatReduction||0)*70+(action.defensiveShapeAdjustment||0)*.32;\n   if(own&&fuV96TransitionActions>0){\n    if(action.kind==='pass'&&forward>1&&success>=.55)value+=16+Math.min(9,forward*2);\n    if(action.kind==='carry'&&forward>0)value+=9;\n   }else if(own&&action.kind==='pass')value+=success*6-(action.exposureRisk||0)*.18;\n  }else if(fuV96Identity==='adaptive'){\n   if(defending&&action.kind==='move')value+=fuV96RecentPatternAdjustment(action,team,holder)+(action.fuV96ThreatReduction||0)*68;\n   if(own&&action.kind==='pass')value+=success*5;\n  }else{\n   if(defending&&action.kind==='move')value+=(action.fuV96ThreatReduction||0)*50;\n   if(own&&action.kind==='pass')value+=success*3;\n  }\n  return Math.max(-42,Math.min(52,value));\n }\n\n tacticalCandidates=function(){\n  const team=turn,holder=owner(),result=fuV95TacticalCandidates();\n  const defending=holder&&holder.t!==team;\n  const beforeOptions=defending?fuV96ThreatOptions(p,holder.id):[];\n  const beforeIndex=fuV96ThreatIndex(beforeOptions);\n  const assignments=defending?fuV96CoverageAssignments(team,beforeOptions,p):new Map();\n  const pressersBefore=defending?fuV96AllPressers(team,holder,p):0;\n\n  for(const action of result){\n   let addition=0;\n   // Todas las capas ofensivas usan la probabilidad completa de gol, no precision abreviada.\n   if(action.kind==='shoot'){\n    const abbreviated=(action.precision||0)*(1-(action.interceptRisk||0));\n    addition+=(Number(action.goalProbability||0)-abbreviated)*46;\n   }\n   if(defending&&action.kind==='move'&&action.mode==='defense'){\n    const hypothetical=p.map(z=>z.id===action.playerId?{...z,c:action.to.c,r:action.to.r}:z);\n    const afterOptions=fuV96ThreatOptions(hypothetical,holder.id),afterIndex=fuV96ThreatIndex(afterOptions);\n    action.fuV96ThreatBefore=beforeIndex;action.fuV96ThreatAfter=afterIndex;\n    action.fuV96ThreatReduction=beforeIndex-afterIndex;\n    addition+=(beforeIndex-afterIndex)*118;\n\n    // Gradiente de cobertura: tambien premia el paso correcto antes de ocupar la ruta exacta.\n    for(let index=0;index<Math.min(3,beforeOptions.length);index++){\n     if(assignments.get(index)!==action.playerId)continue;\n     const option=beforeOptions[index],oldDistance=fuV96DistanceToRoute(action.player,option),newDistance=fuV96DistanceToRoute(action.to,option);\n     const gain=oldDistance-newDistance;\n     addition+=gain*(13+option.probability*18);\n     if(newDistance===0)addition+=7*option.probability;\n     if(gain<0)addition+=gain*8;\n    }\n    const pressersAfter=fuV96AllPressers(team,holder,p,action.playerId,action.to);\n    const movesCloser=cheb(action.to,holder)<cheb(action.player,holder);\n    if(pressersBefore>=1&&pressersAfter>pressersBefore&&movesCloser&&(action.fuV96ThreatReduction||0)<=.01)addition-=12+(pressersAfter-pressersBefore)*5;\n   }\n   action.fuV96ProfileAdjustment=fuV96ProfileAdjustment(action,team,holder);\n   addition+=action.fuV96ProfileAdjustment;\n   action.fuV96MovementPurposeAdjustment=fuV96MovementPurposeAdjustment(action,team,holder);\n   addition+=action.fuV96MovementPurposeAdjustment;\n   action.score=Math.max(-120,Math.min(390,action.score+addition));\n   if(Math.abs(addition)>=3)action.reason=(action.reason||'')+' v96: mapa de tres carriles, coberturas coordinadas y perfil '+FU_V96_IDENTITIES[fuV96Identity].label+' ('+(addition>=0?'+':'')+addition.toFixed(1)+' puntos).';\n   if(action.fuV96MovementPurposeReason)action.reason+=' Ajuste de decisión: '+action.fuV96MovementPurposeReason+' ('+action.fuV96MovementPurposeAdjustment.toFixed(1)+' puntos).';\n  }\n\n  // Variedad controlada: solo evita una repeticion si existe una alternativa cercana.\n  result.sort((a,b)=>b.score-a.score);\n  const recentCpu=fuV96ActionHistory.filter(x=>x.team===CPU_TEAM).slice(-8);\n  for(const action of result.slice(0,10)){\n   const repetitions=recentCpu.filter(x=>x.kind===action.kind&&x.playerNo===action.player?.n&&x.to&&x.to.c===action.to?.c&&x.to.r===action.to?.r).length;\n   if(!repetitions)continue;\n   const alternative=result.find(x=>x!==action&&x.score>=action.score-13&&x.kind!==action.kind);\n   if(alternative){action.score-=Math.min(14,repetitions*4.5);action.fuV96RepeatPenalty=repetitions;}\n  }\n  return result.sort((a,b)=>b.score-a.score||String(sequenceActionKey(a)).localeCompare(String(sequenceActionKey(b))));\n };\n\n evaluateSequencePosition=function(rootTeam,goalDiff){\n  let value=fuV95EvaluateSequencePosition(rootTeam,goalDiff),holder=owner();\n  if(holder){\n   const options=fuV96ThreatOptions(p,holder.id),multiple=Math.max(0,fuV96ThreatIndex(options)-(options[0]?.probability||0));\n   value+=(holder.t===rootTeam?1:-1)*multiple*82;\n   if(rootTeam===CPU_TEAM&&holder.t===HUMAN_TEAM&&fuV96Identity==='adaptive')value-=multiple*18;\n   if(rootTeam===CPU_TEAM&&holder.t===CPU_TEAM&&fuV96Identity==='counter'&&fuV96TransitionActions>0)value+=attackingProgress(CPU_TEAM,holder.c)*9;\n  }\n  return value;\n };\n\n updateAutomaticCpuProfile=function(team,holder){\n  if(team!==CPU_TEAM)return cpuProfile;\n  const threat=holder&&holder.t===HUMAN_TEAM?fuV96ThreatIndex(fuV96ThreatOptions(p,holder.id)):0;\n  if(fuV96Identity==='adaptive')return fuV95UpdateAutomaticCpuProfile(team,holder);\n  if(fuV96Identity==='counter')cpuProfile=holder&&holder.t===HUMAN_TEAM?(threat>=.55?'cautious':'defensive'):(fuV96TransitionActions>0?'aggressive':'balanced');\n  else if(fuV96Identity==='aggressive')cpuProfile=holder&&holder.t===HUMAN_TEAM&&threat>=.72?'defensive':'aggressive';\n  else cpuProfile=FU_V96_IDENTITIES[fuV96Identity].base;\n  return cpuProfile;\n };\n\n function fuV96RecordAction(kind,actor,details){\n  if(simulationRandomState!==null||!actor)return;\n  const item={team:actor.t,playerNo:actor.n,kind,from:details?.from||{c:actor.c,r:actor.r},to:details?.to||null,at:Date.now()};\n  const previous=fuV96ActionHistory[fuV96ActionHistory.length-1];\n  if(actor.t===CPU_TEAM&&previous&&previous.team===HUMAN_TEAM)fuV96TransitionActions=2;\n  else if(actor.t===CPU_TEAM&&fuV96TransitionActions>0)fuV96TransitionActions--;\n  const repeated=fuV96ActionHistory.slice(-6).some(x=>x.team===item.team&&x.kind===item.kind&&x.playerNo===item.playerNo&&x.to&&item.to&&x.to.c===item.to.c&&x.to.r===item.to.r);\n  fuV96ActionHistory.push(item);fuV96ActionHistory=fuV96ActionHistory.slice(-80);fuV96SaveJson(fuV96HistoryStoreKey,fuV96ActionHistory);\n  fuV96Metrics.actions=(fuV96Metrics.actions||0)+1;\n  if(kind==='pass')fuV96Metrics.passes=(fuV96Metrics.passes||0)+1;\n  else if(kind==='shoot')fuV96Metrics.shots=(fuV96Metrics.shots||0)+1;\n  else if(kind==='duel'||kind==='foul')fuV96Metrics.duels=(fuV96Metrics.duels||0)+1;\n  else fuV96Metrics.moves=(fuV96Metrics.moves||0)+1;\n  if(repeated)fuV96Metrics.repeated=(fuV96Metrics.repeated||0)+1;\n  fuV96Metrics.byProfile=fuV96Metrics.byProfile||{};fuV96Metrics.byProfile[fuV96Identity]=(fuV96Metrics.byProfile[fuV96Identity]||0)+1;\n  fuV96SaveJson(FU_V96_METRICS_KEY,fuV96Metrics);\n }\n beginManualAction=function(kind,actor,details={}){fuV96RecordAction(kind,actor,details);return fuV95BeginManualAction(kind,actor,details);};\n finish=function(text){\n  const currentOwner=owner();\n  if(currentOwner&&currentOwner.t===CPU_TEAM&&fuV96LastOwnerTeam!==CPU_TEAM)fuV96TransitionActions=3;\n  fuV96LastOwnerTeam=currentOwner?.t||fuV96LastOwnerTeam;\n  return fuV95Finish(text);\n };\n\n // ==================== SEGUIMIENTO DE ACCIONES EN MÓVIL v96.3 ====================\n // La cámara no se adelanta al destino lógico de la pelota. Acompaña el movimiento\n // animado del jugador, el duelo entre jugadores y recién después el recorrido del pase/remate.\n const fuV963OriginalAnimatePlayerMove=animatePlayerMove;\n const fuV963OriginalAnimateBall=animateBall;\n const fuV963OriginalAnimateDuel=animateDuel;\n const fuV963OriginalFollowBallOnMobile=followBallOnMobile;\n const fuV963OriginalResetToKickoff=resetToKickoff;\n let fuV963PreferredFocusX=null,fuV963ActiveFocusX=null,fuV963ActionFollowing=false,fuV963TrackSerial=0;\n const fuV963CameraTracks=new Map();\n\n function fuV963MobileViewport(){\n  const field=$('field'),viewport=$('pitchScrollArea')||document.querySelector('.pitch-scroll-area')||document.querySelector('.board');\n  if(!field||!viewport||!window.matchMedia('(max-width: 680px) and (orientation: portrait)').matches)return null;\n  if(field.scrollWidth<=viewport.clientWidth+2)return null;\n  return {field,viewport,scale:field.clientWidth/1990};\n }\n function fuV963ScrollToFieldX(fieldX,force=false){\n  const view=fuV963MobileViewport();if(!view||!Number.isFinite(fieldX))return;\n  // El viewBox comienza en -95; se traduce la coordenada SVG a píxeles del scroll.\n  const pixelX=(fieldX+95)*view.scale,left=view.viewport.scrollLeft,width=view.viewport.clientWidth;\n  const margin=width*.24;\n  if(!force&&pixelX>=left+margin&&pixelX<=left+width-margin)return;\n  const maxLeft=Math.max(0,view.viewport.scrollWidth-width);\n  const target=Math.max(0,Math.min(maxLeft,pixelX-width*.5));\n  if(Math.abs(target-left)<2)return;\n  if(fuV963ActionFollowing)view.viewport.scrollLeft=left+(target-left)*.30;\n  else view.viewport.scrollTo({left:target,behavior:'smooth'});\n }\n function fuV963RefreshActionFocus(){\n  if(!playersG)return;\n  playersG.querySelectorAll('.fu-v963-action-focus').forEach(node=>node.classList.remove('fu-v963-action-focus'));\n  for(const track of fuV963CameraTracks.values())for(const id of track.playerIds){\n   const node=nodePlayer(id);if(node)node.classList.add('fu-v963-action-focus');\n  }\n }\n function fuV963PrimaryCameraTrack(){\n  return [...fuV963CameraTracks.values()].sort((a,b)=>b.priority-a.priority||a.order-b.order)[0]||null;\n }\n function fuV963RefreshCameraState(){\n  const primary=fuV963PrimaryCameraTrack();\n  fuV963ActionFollowing=!!primary;\n  fuV963ActiveFocusX=primary?primary.x:null;\n  if(primary)fuV963PreferredFocusX=primary.x;\n  return primary;\n }\n function fuV963InjectActionFollowStyles(){\n  if($('fuV963ActionFollowStyle'))return;\n  const style=document.createElement('style');style.id='fuV963ActionFollowStyle';\n  style.textContent='.fu-v963-action-focus{filter:drop-shadow(0 0 9px #e5ff9c) drop-shadow(0 0 4px #b8f36b)!important}.mobile-pitch-hint:empty::before{content:\"↔ Deslizá para recorrer la cancha · la cámara acompaña al jugador que actúa y la trayectoria de la pelota\"!important}';\n  document.head.appendChild(style);\n }\n followBallOnMobile=function(){\n  // El encuadre permanece en la última acción. En reposo, antes de actuar, sigue la pelota.\n  const focus=Number.isFinite(fuV963ActiveFocusX)?fuV963ActiveFocusX:Number.isFinite(fuV963PreferredFocusX)?fuV963PreferredFocusX:X(ball.c);\n  fuV963ScrollToFieldX(focus,false);\n };\n async function fuV963TrackAction(startAnimation,duration,xAt,finalX,playerIds=[],priority=1){\n  const firstX=xAt(0),endX=Number.isFinite(finalX)?finalX:xAt(1),trackId=++fuV963TrackSerial;\n  const track={id:trackId,order:trackId,priority,x:firstX,playerIds:(playerIds||[]).filter(value=>value!==null&&value!==undefined)};\n  fuV963CameraTracks.set(trackId,track);fuV963RefreshCameraState();fuV963RefreshActionFocus();fuV963ScrollToFieldX(fuV963ActiveFocusX,false);\n  const started=performance.now();\n  const cameraPromise=new Promise(resolve=>{\n   const tick=now=>{\n    const t=duration<=0?1:clamp01((now-started)/duration);track.x=xAt(t);\n    fuV963RefreshCameraState();fuV963ScrollToFieldX(fuV963ActiveFocusX,false);\n    if(t<1)requestAnimationFrame(tick);else resolve();\n   };\n   requestAnimationFrame(tick);\n  });\n  try{\n   const animationPromise=startAnimation();\n   const values=await Promise.all([Promise.resolve(animationPromise),cameraPromise]);\n   return values[0];\n  }finally{\n   fuV963CameraTracks.delete(trackId);fuV963RefreshActionFocus();\n   const primary=fuV963RefreshCameraState();\n   if(primary)fuV963ScrollToFieldX(fuV963ActiveFocusX,false);\n   else{fuV963ActionFollowing=false;fuV963ActiveFocusX=null;fuV963PreferredFocusX=endX;fuV963ScrollToFieldX(endX,false);}\n  }\n }\n animatePlayerMove=function(id,from,to,options={}){\n  const dist=Math.max(Math.abs(to.c-from.c),Math.abs(to.r-from.r));\n  const slow=!!options.slow,baseDur=slow?1100+dist*300:255+Math.max(0,dist-1)*120;\n  const duration=Math.round(baseDur*(slowCpuVisuals?(slow?1.25:2.0):1));\n  const xAt=t=>X(from.c)+(X(to.c)-X(from.c))*easeInOut(t);\n  const finalX=X(to.c);\n  return fuV963TrackAction(()=>fuV963OriginalAnimatePlayerMove(id,from,to,options),duration,xAt,finalX,[id],2);\n };\n animateDuel=function(attackerId,rivalId,fromA,toA,fromR,toR,ballFrom,ballTo,options={}){\n  const result=options.result||'frente';\n  const duration=Math.round((result==='atras'?500:430)*(slowCpuVisuals?1.8:1));\n  const xAt=t=>{\n   const e=easeInOut(t),a=X(fromA.c)+(X(toA.c)-X(fromA.c))*e,r=X(fromR.c)+(X(toR.c)-X(fromR.c))*e;\n   return (a+r)/2;\n  };\n  const finalX=(X(toA.c)+X(toR.c))/2;\n  return fuV963TrackAction(()=>fuV963OriginalAnimateDuel(attackerId,rivalId,fromA,toA,fromR,toR,ballFrom,ballTo,options),duration+180,xAt,finalX,[attackerId,rivalId],3);\n };\n animateBall=function(from,to,options={}){\n  const arc=options.arc===undefined?true:!!options.arc,goal=!!options.goal;\n  const dist=Math.max(Math.abs(to.c-from.c),Math.abs(to.r-from.r));\n  const baseDur=options.duration??Math.round((315+dist*72)*(goal?1:2));\n  const dur=Math.round(baseDur*(slowCpuVisuals?1.55:1));\n  const travelDur=goal?Math.max(dur,1750):dur,totalDur=travelDur+(goal?170:90);\n  const a=point(from.c,from.r,!!from.owner),b=point(to.c,to.r,!!to.owner);\n  const mx=(a.x+b.x)/2,my=(a.y+b.y)/2,dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;\n  const perp={x:-dy/len,y:dx/len},passer=p.find(z=>z.id===from.owner);\n  const curve=(arc&&dist>0)?(passer&&passer.n===10?Math.min(68,20+dist*7):Math.min(42,12+dist*5)):0;\n  const control={x:mx+perp.x*curve,y:my+perp.y*curve};\n  const xAt=t=>{\n   if(t*totalDur>=travelDur)return b.x;\n   const e=easeInOut(clamp01((t*totalDur)/travelDur)),u=1-e;\n   return u*u*a.x+2*u*e*control.x+e*e*b.x;\n  };\n  const ids=[from.owner,to.owner].filter((id,index,array)=>id!==null&&id!==undefined&&array.indexOf(id)===index);\n  return fuV963TrackAction(()=>fuV963OriginalAnimateBall(from,to,options),totalDur,xAt,b.x,ids,1);\n };\n resetToKickoff=function(...args){\n  fuV963PreferredFocusX=null;fuV963ActiveFocusX=null;fuV963ActionFollowing=false;fuV963CameraTracks.clear();fuV963RefreshActionFocus();\n  return fuV963OriginalResetToKickoff(...args);\n };\n fuV963InjectActionFollowStyles();\n\n function fuV96DrawThreatMap(){\n  const old=$('fuV96ThreatLayer');if(old)old.remove();\n  if(!fuV96ShowThreats||simulationRandomState!==null||brainTrainingRunning)return;\n  const holder=owner();if(!holder||holder.t!==HUMAN_TEAM)return;\n  const options=fuV96ThreatOptions(p,holder.id).filter(x=>x.probability>=.08).slice(0,3);\n  if(!options.length)return;\n  const layer=document.createElementNS(NS,'g');layer.id='fuV96ThreatLayer';layer.setAttribute('pointer-events','none');\n  options.forEach((option,index)=>{\n   const points=[{c:holder.c,r:holder.r},...(option.path||[])].map(q=>X(q.c)+','+Y(q.r)).join(' ');\n   const line=document.createElementNS(NS,'polyline');line.setAttribute('points',points);line.setAttribute('class','fu-v96-threat-line fu-v96-threat-'+index);line.setAttribute('opacity',String(.28+Math.min(.44,option.probability*.48)));layer.appendChild(line);\n  });\n  const field=$('field');if(field)field.insertBefore(layer,playersG||null);\n }\n refresh=function(){const value=fuV95Refresh();requestAnimationFrame(fuV96DrawThreatMap);return value;};\n\n function fuV96SetIdentity(id,announce=true){\n  if(fuV96TournamentIdentity)id=fuV96TournamentIdentity;\n  if(!FU_V96_IDENTITIES[id])return false;fuV96Identity=id;\n  if(!fuV96TournamentIdentity)fuV96SaveJson(FU_V96_PROFILE_KEY,id);\n  updateAutomaticCpuProfile(CPU_TEAM,owner());\n  const select=$('fuV96ProfileSelect');if(select)select.value=id;\n  const description=$('fuV96ProfileDescription');if(description)description.textContent=fuV96TournamentIdentity?('Rival: '+fuV96TournamentOpponentName+' · perfil fijo: '+FU_V96_IDENTITIES[id].label+'. '+FU_V96_IDENTITIES[id].short):FU_V96_IDENTITIES[id].short;\n  if(announce)say(fuV96TournamentIdentity?('Rival de torneo: '+fuV96TournamentOpponentName+' juega con perfil '+FU_V96_IDENTITIES[id].label+'.'):('Perfil CPU '+FU_V96_IDENTITIES[id].label+': '+FU_V96_IDENTITIES[id].short));\n  return true;\n }\n\n function fuV96RunAudit(){\n  const checks=[],check=(name,ok,detail)=>checks.push({name,ok:!!ok,detail:detail||''}),snapshot=captureSequenceState(),identity=fuV96Identity;\n  try{\n   check('Reglas base',ACTIONS_PER_TURN===3&&BALL_REACH(10)===8,'Tres acciones por turno; alcance base del jugador 10: 8 casilleros.');\n   const findMoveParity=(number,dc,dr)=>{\n    for(let r=0;r<R;r++)for(let c=0;c<C;c++){\n     const mover={id:99000+number,t:HUMAN_TEAM,n:number,c,r},target={c:c+dc,r:r+dr};\n     if(target.c<0||target.c>=C||target.r<0||target.r>=R)continue;\n     const route=[{c,r},...passPathCells({c,r},target)];\n     if(route.some(cell=>p.some(z=>z.c===cell.c&&z.r===cell.r)))continue;\n     const oldOwner=ball.owner;\n     ball.owner=null;const withoutBall=pLegal(target.c,target.r,mover);\n     ball.owner=mover.id;const withBall=pLegal(target.c,target.r,mover);\n     ball.owner=oldOwner;\n     return {withoutBall,withBall};\n    }\n    return null;\n   };\n   const regularMoveParity=findMoveParity(10,2,0);\n   const specialStraightParity=findMoveParity(7,3,0);\n   const specialDiagonalParity=findMoveParity(7,2,2);\n   const specialHorseParity=findMoveParity(7,2,1);\n   check('Paridad de traslado común',!!regularMoveParity&&regularMoveParity.withoutBall&&regularMoveParity.withBall,'El jugador común puede trasladarse 2 casilleros rectos con y sin pelota.');\n   check('Paridad de movimientos especiales',[specialStraightParity,specialDiagonalParity,specialHorseParity].every(x=>!!x&&x.withoutBall&&x.withBall),'Los jugadores 3, 4, 7 y 8 conservan movimientos rectos, diagonales y salto 2×1 en ambos estados.');\n   const fakeShooter={id:8801,t:HUMAN_TEAM,n:10,c:13,r:5};\n   const fakeState=[fakeShooter,{id:8802,t:CPU_TEAM,n:1,c:17,r:0},{id:8803,t:CPU_TEAM,n:2,c:15,r:4},{id:8804,t:CPU_TEAM,n:3,c:15,r:8},{id:8805,t:CPU_TEAM,n:4,c:16,r:10},{id:8806,t:CPU_TEAM,n:6,c:15,r:1}];\n   const rows=[4,5,6].map(r=>estimateShotProbability(fakeShooter,{c:13,r:5},{c:17,r},fakeState));\n   check('Tres carriles de remate',rows.length===3&&rows.every(x=>Number.isFinite(x.probability)),'Filas 4, 5 y 6 evaluadas.');\n   const i2=trajectoryInterceptionRisk({c:13,r:5},{c:17,r:5},HUMAN_TEAM,[fakeShooter,{id:1,t:CPU_TEAM,n:2,c:15,r:5}]);\n   const i5=trajectoryInterceptionRisk({c:13,r:5},{c:17,r:5},HUMAN_TEAM,[fakeShooter,{id:2,t:CPU_TEAM,n:5,c:15,r:5}]);\n   check('Intercepcion reglamentaria',Math.abs(i2.risk-.75)<.001&&Math.abs(i5.risk-.65)<.001,'75% para 2/6 y 65% para 5.');\n   check('Seis perfiles',Object.keys(FU_V96_IDENTITIES).length===6,Object.values(FU_V96_IDENTITIES).map(x=>x.label).join(', '));\n   if(fuV95ConfigureTacticalScenario){\n    const scenario=TACTICAL_TEST_SCENARIOS.find(x=>x.id==='protect-area');\n    const firstActions=new Set();\n    for(const id of Object.keys(FU_V96_IDENTITIES)){\n     configureTacticalScenario(scenario,CPU_TEAM);fuV96Identity=id;updateAutomaticCpuProfile(CPU_TEAM,owner());\n     const first=tacticalCandidates()[0];if(first)firstActions.add(sequenceActionKey(first));\n    }\n    check('Perfiles perceptibles',firstActions.size>=2,firstActions.size+' primeras decisiones distintas en el escenario defensivo.');\n   }\n   const foulState=captureSequenceState();freeKickRequiredId=123;freeKickAwardedTeam=1;restoreSequenceState(foulState);\n   check('Estado simulable completo',freeKickRequiredId===foulState.freeKickRequiredId&&freeKickAwardedTeam===foulState.freeKickAwardedTeam,'La busqueda restaura tambien el tiro libre.');\n  }catch(error){check('Ejecucion de auditoria',false,String(error?.message||error));}\n  finally{restoreSequenceState(snapshot);fuV96Identity=identity;updateAutomaticCpuProfile(CPU_TEAM,owner());refresh();}\n  const passed=checks.filter(x=>x.ok).length,report={version:FU_V96_VERSION,at:new Date().toISOString(),passed,total:checks.length,checks};\n  fuV96LastAudit=report;\n  const node=$('fuV96AuditResult');if(node){node.textContent=passed+'/'+checks.length+' controles aprobados';node.classList.toggle('fail',passed!==checks.length);node.title=checks.map(x=>(x.ok?'OK ':'FALLO ')+x.name+': '+x.detail).join('\\n');}\n  try{parent.postMessage({type:'fu:audit',report},'*');}catch(_e){}\n  return report;\n }\n\n const FU_PRACTICE_CLUBS=[{\"id\":\"aldosivi\",\"name\":\"Aldosivi\",\"primary\":\"#08764F\",\"secondary\":\"#F2D33D\",\"number\":\"#FFFFFF\",\"kit\":\"stripes\"},{\"id\":\"argentinos-juniors\",\"name\":\"Argentinos Juniors\",\"primary\":\"#D71930\",\"secondary\":\"#FFFFFF\",\"number\":\"#FFFFFF\",\"kit\":\"double-stripe\"},{\"id\":\"atletico-tucuman\",\"name\":\"Atlético Tucumán\",\"primary\":\"#F7F9FB\",\"secondary\":\"#75C4E8\",\"number\":\"#174B77\",\"kit\":\"pinstripes\"},{\"id\":\"banfield\",\"name\":\"Banfield\",\"primary\":\"#F7F8F4\",\"secondary\":\"#087148\",\"number\":\"#087148\",\"kit\":\"central\"},{\"id\":\"barracas-central\",\"name\":\"Barracas Central\",\"primary\":\"#C8202D\",\"secondary\":\"#FFFFFF\",\"number\":\"#FFFFFF\",\"kit\":\"stripes\"},{\"id\":\"belgrano\",\"name\":\"Belgrano\",\"primary\":\"#08A0D4\",\"secondary\":\"#101820\",\"number\":\"#101820\",\"kit\":\"shoulders\"},{\"id\":\"boca-juniors\",\"name\":\"Boca Juniors\",\"primary\":\"#082D65\",\"secondary\":\"#F5C928\",\"number\":\"#FFFFFF\",\"kit\":\"band\"},{\"id\":\"central-cordoba\",\"name\":\"Central Córdoba\",\"primary\":\"#171717\",\"secondary\":\"#FFFFFF\",\"number\":\"#FFFFFF\",\"kit\":\"wide-stripes\"},{\"id\":\"defensa-y-justicia\",\"name\":\"Defensa y Justicia\",\"primary\":\"#F2D525\",\"secondary\":\"#16854A\",\"number\":\"#123D2A\",\"kit\":\"shoulders\"},{\"id\":\"deportivo-riestra\",\"name\":\"Deportivo Riestra\",\"primary\":\"#171717\",\"secondary\":\"#F7F7F7\",\"number\":\"#FFFFFF\",\"kit\":\"wide-stripes\"},{\"id\":\"estudiantes-la-plata\",\"name\":\"Estudiantes de La Plata\",\"primary\":\"#D5212B\",\"secondary\":\"#FFFFFF\",\"number\":\"#FFFFFF\",\"kit\":\"stripes\"},{\"id\":\"estudiantes-rio-cuarto\",\"name\":\"Estudiantes de Río Cuarto\",\"primary\":\"#F7F9FB\",\"secondary\":\"#176BC1\",\"number\":\"#153C68\",\"kit\":\"pinstripes\"},{\"id\":\"gimnasia-la-plata\",\"name\":\"Gimnasia y Esgrima La Plata\",\"primary\":\"#F4F6F8\",\"secondary\":\"#183D86\",\"number\":\"#173768\",\"kit\":\"chestband\"},{\"id\":\"gimnasia-mendoza\",\"name\":\"Gimnasia y Esgrima de Mendoza\",\"primary\":\"#F7F7F7\",\"secondary\":\"#202020\",\"number\":\"#171717\",\"kit\":\"stripes\"},{\"id\":\"huracan\",\"name\":\"Huracán\",\"primary\":\"#F7F7F3\",\"secondary\":\"#D92735\",\"number\":\"#D92735\",\"kit\":\"central\"},{\"id\":\"independiente\",\"name\":\"Independiente\",\"primary\":\"#D71F2B\",\"secondary\":\"#FFFFFF\",\"number\":\"#FFFFFF\",\"kit\":\"shoulders\"},{\"id\":\"independiente-rivadavia\",\"name\":\"Independiente Rivadavia\",\"primary\":\"#153D96\",\"secondary\":\"#F7F7F7\",\"number\":\"#FFFFFF\",\"kit\":\"shoulders\"},{\"id\":\"instituto\",\"name\":\"Instituto\",\"primary\":\"#D3212D\",\"secondary\":\"#FFFFFF\",\"number\":\"#FFFFFF\",\"kit\":\"stripes\"},{\"id\":\"lanus\",\"name\":\"Lanús\",\"primary\":\"#7D2038\",\"secondary\":\"#C86D83\",\"number\":\"#FFFFFF\",\"kit\":\"sleeves\"},{\"id\":\"newells-old-boys\",\"name\":\"Newell’s Old Boys\",\"primary\":\"#D5222B\",\"secondary\":\"#161616\",\"number\":\"#FFFFFF\",\"kit\":\"half\"},{\"id\":\"platense\",\"name\":\"Platense\",\"primary\":\"#F7F7F3\",\"secondary\":\"#7A4A2A\",\"number\":\"#7A4A2A\",\"kit\":\"band\"},{\"id\":\"racing-club\",\"name\":\"Racing Club\",\"primary\":\"#77C5E8\",\"secondary\":\"#FFFFFF\",\"number\":\"#173A62\",\"kit\":\"stripes\"},{\"id\":\"river-plate\",\"name\":\"River Plate\",\"primary\":\"#F8F8F4\",\"secondary\":\"#D51F31\",\"number\":\"#1D2832\",\"kit\":\"sash\"},{\"id\":\"rosario-central\",\"name\":\"Rosario Central\",\"primary\":\"#62B9E7\",\"secondary\":\"#F7D32F\",\"number\":\"#FFFFFF\",\"kit\":\"stripes\"},{\"id\":\"san-lorenzo\",\"name\":\"San Lorenzo\",\"primary\":\"#082B68\",\"secondary\":\"#D52535\",\"number\":\"#FFFFFF\",\"kit\":\"stripes\"},{\"id\":\"sarmiento\",\"name\":\"Sarmiento\",\"primary\":\"#087447\",\"secondary\":\"#FFFFFF\",\"number\":\"#FFFFFF\",\"kit\":\"stripes\"},{\"id\":\"talleres\",\"name\":\"Talleres\",\"primary\":\"#F7F9FB\",\"secondary\":\"#102E78\",\"number\":\"#102E78\",\"kit\":\"wide-stripes\"},{\"id\":\"tigre\",\"name\":\"Tigre\",\"primary\":\"#123F8B\",\"secondary\":\"#D72835\",\"number\":\"#FFFFFF\",\"kit\":\"stripes\"},{\"id\":\"union\",\"name\":\"Unión\",\"primary\":\"#D41F2F\",\"secondary\":\"#FFFFFF\",\"number\":\"#FFFFFF\",\"kit\":\"wide-stripes\"},{\"id\":\"velez\",\"name\":\"Vélez Sarsfield\",\"primary\":\"#F7F7F7\",\"secondary\":\"#102C57\",\"number\":\"#102C57\",\"kit\":\"v\"}];\n\n function fuV96InstallUi(){\n  // Interfaz pública: no expone herramientas de auditoría ni selectores internos de la CPU.\n  fuV96SetIdentity(fuV96Identity,false);\n  fuV96DrawThreatMap();\n  if(tournamentMode)return;\n  const controls=document.querySelector('.controls');\n  if(!controls||$('fuPracticeKitStudio'))return;\n  const studio=document.createElement('section');\n  studio.id='fuPracticeKitStudio';studio.className='fu-practice-kit-studio';\n  const clubs=FU_PRACTICE_CLUBS;\n  const options='<option value=\"custom\">Personalizada</option>'+clubs.map(c=>'<option value=\"'+c.id+'\">'+c.name+'</option>').join('');\n  const patterns=[['plain','Lisa'],['stripes','Rayas'],['pinstripes','Rayas finas'],['wide-stripes','Rayas anchas'],['double-stripe','Doble franja'],['central','Franja central'],['band','Banda'],['chestband','Banda horizontal'],['sash','Banda diagonal'],['half','Mitad y mitad'],['badge','Centro'],['shoulders','Hombros'],['sleeves','Mangas'],['hoops','Franjas horizontales'],['v','V']];\n  const patternOptions=patterns.map(x=>'<option value=\"'+x[0]+'\">'+x[1]+'</option>').join('');\n  studio.innerHTML='<div class=\"fu-kit-heading\"><strong>CAMISETAS · PRÁCTICA</strong><span>Elegí un club o armá tus propios colores.</span></div>'+[1,2].map(t=>'<div class=\"fu-kit-team\"><strong>Equipo '+t+'</strong><label>Modelo<select id=\"fuKitClub'+t+'\" aria-label=\"Modelo de camiseta del Equipo '+t+'\">'+options+'</select></label><label>Diseño<select id=\"fuKitPattern'+t+'\" aria-label=\"Diseño de camiseta del Equipo '+t+'\">'+patternOptions+'</select></label><label>Color del diseño<input id=\"fuKitAccent'+t+'\" type=\"color\" value=\"'+(kitColors[t]||'#ffffff')+'\" aria-label=\"Color del diseño del Equipo '+t+'\"></label></div>').join('');\n  controls.insertAdjacentElement('afterend',studio);\n  function markCustom(t){const select=$('fuKitClub'+t);if(select)select.value='custom';}\n  function syncInputs(t){const main=$('c'+t),num=$('c'+t+'a'),pattern=$('fuKitPattern'+t),accent=$('fuKitAccent'+t);if(main)main.value=colors[t];if(num)num.value=accentColors[t];if(pattern)pattern.value=kitPatterns[t]||'plain';if(accent)accent.value=kitColors[t]||'#ffffff';}\n  function chooseClub(t,id){\n   const club=clubs.find(c=>c.id===id);if(!club){syncInputs(t);drawPlayers();return;}\n   colors[t]=club.primary;accentColors[t]=club.number;numberColors[t]=club.number;kitColors[t]=club.secondary;kitPatterns[t]=club.kit;\n   syncInputs(t);drawPlayers();refresh();\n  }\n  [1,2].forEach(t=>{\n   const clubSelect=$('fuKitClub'+t),patternSelect=$('fuKitPattern'+t),accentInput=$('fuKitAccent'+t);\n   clubSelect.value='custom';patternSelect.value=kitPatterns[t]||'plain';accentInput.value=kitColors[t]||'#ffffff';\n   clubSelect.onchange=()=>chooseClub(t,clubSelect.value);\n   patternSelect.onchange=()=>{kitPatterns[t]=patternSelect.value;markCustom(t);drawPlayers();refresh();};\n   accentInput.oninput=()=>{kitColors[t]=accentInput.value;markCustom(t);drawPlayers();};\n   const main=$('c'+t),num=$('c'+t+'a');\n   if(main){const old=main.oninput;main.oninput=e=>{if(old)old.call(main,e);markCustom(t);};}\n   if(num){const old=num.oninput;num.oninput=e=>{if(old)old.call(num,e);markCustom(t);};}\n  });\n }\n\n window.FUTBOL_UNICO_V96={\n  version:FU_V96_VERSION,\n  baseline:'d62eae16f15984cdb4397b93d8c4a34e89392efd',\n  profiles:Object.keys(FU_V96_IDENTITIES),\n  getProfile:()=>fuV96Identity,\n  setProfile:id=>fuV96SetIdentity(id,true),\n  runAudit:fuV96RunAudit,\n  getLastAudit:()=>fuV96LastAudit?JSON.parse(JSON.stringify(fuV96LastAudit)):null,\n  getMetrics:()=>JSON.parse(JSON.stringify(fuV96Metrics)),\n  getThreats:()=>fuV96ThreatOptions(p,ball.owner).map(x=>({type:x.type,probability:x.probability,row:x.row}))\n };\n fuV96InstallUi();\n\n // v96.4: en partidos de torneo la CPU siempre queda en automático.\n // La pausa manual sigue disponible en Práctica, donde tournamentMode es false.\n function fuV964LockTournamentCpu(){\n  if(!tournamentMode)return;\n  const toggle=$('cpuToggleBtn');\n  if(toggle){\n   toggle.hidden=true;toggle.disabled=true;toggle.style.display='none';toggle.onclick=null;\n   toggle.setAttribute('aria-hidden','true');\n  }\n  const originalSetCpuEnabled=setCpuEnabled;\n  setCpuEnabled=function(on){\n   if(tournamentMode&&!matchClockFinished)on=true;\n   return originalSetCpuEnabled(on);\n  };\n }\n fuV964LockTournamentCpu();\n // Las auditorías internas no se ejecutan ni se muestran en la versión pública.\n // ================== FIN FUTBOL UNICO v96 ==================\n";
const V96_GAME_STYLES = "\n/* Evita duplicar la navegación del portal si la base contiene una cabecera del shell. */\n.fu-shell-header,.fu-shell-nav,.fu-shell-header + nav { display:none!important; }\n:root {\n  color-scheme:dark;\n  --fu96-bg:#06080c;\n  --fu96-coal:#0b0f16;\n  --fu96-panel:#10151f;\n  --fu96-panel-2:#151c28;\n  --fu96-line:rgba(233,238,246,.11);\n  --fu96-text:#e9eef6;\n  --fu96-muted:#8b96a8;\n  --fu96-lime:#c8ff2e;\n  --fu96-cyan:#3ee6ff;\n  --fu96-gold:#ffb01f;\n  --fu96-danger:#ff4d5e;\n  --fu96-blue:#75b8ff;\n}\nhtml { background:var(--fu96-bg)!important; }\nbody {\n  min-height:100vh!important;\n  color:var(--fu96-text)!important;\n  background:\n    radial-gradient(ellipse at 50% -12%,rgba(200,255,46,.075),transparent 48%),\n    radial-gradient(ellipse at 100% 80%,rgba(62,230,255,.045),transparent 34%),\n    repeating-linear-gradient(-55deg,transparent 0 26px,rgba(255,255,255,.012) 26px 27px),\n    var(--fu96-bg)!important;\n  padding:clamp(8px,1.4vw,20px)!important;\n  font-family:Inter,\"Segoe UI\",system-ui,sans-serif!important;\n  color-scheme:dark;\n}\nbody:before { content:none!important; }\n.app { width:min(1580px,100%)!important;max-width:none!important;margin:0 auto!important; }\na { color:var(--fu96-cyan); }\na:hover { color:#a7f5ff; }\n.head {\n  position:relative!important;align-items:stretch!important;gap:12px!important;\n  padding:clamp(12px,1.5vw,19px)!important;\n  border:1px solid var(--fu96-line)!important;border-top:2px solid rgba(200,255,46,.78)!important;\n  border-radius:5px!important;\n  background:linear-gradient(135deg,rgba(21,28,40,.98),rgba(10,14,21,.98))!important;\n  box-shadow:0 18px 48px rgba(0,0,0,.28),inset 0 1px rgba(255,255,255,.025)!important;\n  color:var(--fu96-text)!important;\n}\n.head:after { content:\"TACTICAL MATCH CENTER\";position:absolute;top:8px;right:12px;color:rgba(139,150,168,.36);font-size:7px;font-weight:950;letter-spacing:.22em;pointer-events:none; }\n.scoreboard-block { display:grid;gap:9px;min-width:min(700px,100%); }\n.scoreboard-line { align-items:center; }\n.scoreboard-score { gap:7px!important; }\n.scoreboard-score b { color:#d4dbe6!important;letter-spacing:.045em; }\n.scoreboard-score b,.score { font-variant-numeric:tabular-nums; }\n.score {\n  display:inline-grid;min-width:38px;min-height:38px;place-items:center;\n  border:1px solid rgba(233,238,246,.15)!important;border-radius:3px!important;\n  background:linear-gradient(180deg,#1a2230,#0b0f16)!important;\n  color:var(--fu96-lime)!important;box-shadow:inset 0 1px rgba(255,255,255,.04)!important;\n}\n.scoreboard-score .score { margin:0 2px!important; }\n.scoreboard-score b:first-child,.scoreboard-score b:last-child { color:var(--fu96-text)!important; }\n.match-clock { gap:7px!important; }\n.match-clock-time { color:var(--fu96-lime)!important;font-variant-numeric:tabular-nums;text-shadow:0 0 22px rgba(200,255,46,.13); }\n.match-clock-state { border:1px solid rgba(200,255,46,.25)!important;border-radius:3px!important;background:rgba(200,255,46,.07)!important;color:var(--fu96-lime)!important; }\n.match-clock-side,.match-clock-label,.match-clock-hint,.sub,.msg,.info { color:var(--fu96-muted)!important; }\n.match-narrative { border:1px solid rgba(62,230,255,.16)!important;border-radius:4px!important;background:rgba(6,8,12,.55)!important;color:#c5cfde!important; }\n.match-narrative-head { color:var(--fu96-cyan)!important; }\n.controls {\n  align-content:center!important;gap:7px!important;padding:8px!important;\n  border:1px solid rgba(233,238,246,.08)!important;border-radius:4px!important;\n  background:rgba(6,8,12,.36)!important;\n}\n.ctrl { border:1px solid rgba(233,238,246,.12)!important;border-radius:3px!important;background:#0b0f16!important;color:#c6cfdd!important; }\nselect,input[type=text],input[type=number],input[type=search],textarea {\n  border:1px solid rgba(233,238,246,.16)!important;border-radius:3px!important;\n  background:#090d13!important;color:var(--fu96-text)!important;\n}\ninput::placeholder,textarea::placeholder { color:#68758b!important; }\nbutton {\n  min-height:40px;border:1px solid rgba(233,238,246,.14)!important;border-radius:3px!important;\n  padding:7px 11px!important;\n  background:linear-gradient(180deg,#1a2230,#111722)!important;\n  color:#e1e7f0!important;font-size:11px;font-weight:900!important;letter-spacing:.015em;\n  box-shadow:none!important;\n  transition:background .15s ease,border-color .15s ease,color .15s ease,transform .15s ease,filter .15s ease!important;\n}\nbutton:hover { transform:translateY(-1px);border-color:rgba(62,230,255,.55)!important;background:linear-gradient(180deg,#202c3c,#131c28)!important;color:#fff!important;box-shadow:0 7px 18px rgba(0,0,0,.24)!important; }\nbutton.primary { border-color:var(--fu96-lime)!important;background:linear-gradient(180deg,#ddff74,var(--fu96-lime))!important;color:#10150a!important;box-shadow:0 0 20px rgba(200,255,46,.09)!important; }\nbutton.primary:hover { border-color:#e9ffad!important;background:#e0ff7e!important;color:#10150a!important; }\nbutton:disabled { opacity:.42!important;cursor:not-allowed!important;transform:none!important; }\nbutton:focus-visible,select:focus-visible,input:focus-visible,a:focus-visible { outline:2px solid var(--fu96-cyan)!important;outline-offset:3px!important; }\ninput[type=color] { border:1px solid rgba(233,238,246,.12)!important;border-radius:3px!important;background:#0b0f16!important; }\n.board {\n  position:relative!important;margin-top:14px!important;\n  border:1px solid rgba(200,255,46,.58)!important;border-radius:5px!important;\n  box-shadow:0 26px 70px rgba(0,0,0,.55),0 0 0 1px rgba(62,230,255,.075),inset 0 1px rgba(255,255,255,.12)!important;\n  background:#174923!important;\n}\n.board:not(:fullscreen):not(:-webkit-full-screen) { padding:7px!important;background:linear-gradient(145deg,#111a23,#0b0f16)!important; }\n.board:not(:fullscreen):not(:-webkit-full-screen) #field { border:1px solid rgba(200,255,46,.18)!important;border-radius:2px!important;box-shadow:0 2px 12px rgba(0,0,0,.3)!important; }\n.board:after { pointer-events:none; }\n.pitch-scroll-area { position:relative;z-index:3; }\n.player { transition:filter .16s ease,opacity .16s ease; }\n.player:hover { filter:drop-shadow(0 4px 5px rgba(0,0,0,.65)) drop-shadow(0 0 6px rgba(62,230,255,.48))!important; }\n.player.sel .ring { stroke:var(--fu96-lime)!important;stroke-width:5!important; }\n.cell.pl { fill:rgba(200,255,46,.13)!important;stroke:rgba(233,255,174,.8)!important; }\n.cell.sel { fill:rgba(62,230,255,.14)!important;stroke:var(--fu96-cyan)!important; }\n.cell.bl { fill:rgba(255,176,31,.24)!important;stroke:#ffd36c!important; }\n.ballTrail { stroke:var(--fu96-cyan)!important;stroke-width:2.4!important;opacity:.52!important; }\n.bottom { padding:9px 2px 0; }\n.state { color:var(--fu96-text)!important; }\n.msg { min-height:24px; }\n.advisor,.brain-learning,.match-analytics,.sequence-search,.strategy-plan,.tactic-library,.sequence-card,.sequence-results {\n  border:1px solid rgba(233,238,246,.1)!important;border-radius:4px!important;\n  background:linear-gradient(145deg,rgba(16,21,31,.98),rgba(10,14,21,.98))!important;\n  color:var(--fu96-text)!important;box-shadow:0 14px 34px rgba(0,0,0,.22)!important;\n}\n.advisor-kicker,.strategy-plan-top,.tf-kicker { color:var(--fu96-cyan)!important; }\n.advisor-main,.strategy-objective,.strategy-plan,.tactic-item,.brain-title { color:var(--fu96-text)!important; }\n.advisor-reason,.advisor-meta,.advisor-foot,.ma-note,.info { color:var(--fu96-muted)!important; }\n.match-analytics th,.sequence-table th { color:var(--fu96-cyan)!important; }\n.match-analytics td,.sequence-table td { border-color:rgba(233,238,246,.08)!important; }\n.goal-celebration-card,.halftime-card {\n  border:1px solid rgba(200,255,46,.42)!important;border-radius:5px!important;\n  background:linear-gradient(145deg,#151c28,#080b10)!important;color:var(--fu96-text)!important;\n  box-shadow:0 28px 90px rgba(0,0,0,.78),0 0 45px rgba(200,255,46,.055)!important;\n}\n.goal-celebration-kicker,.goal-celebration-title { color:var(--fu96-lime)!important; }\n.fu-v96-console {\n  display:grid;grid-template-columns:minmax(230px,1fr) minmax(180px,240px) auto auto minmax(115px,auto);\n  align-items:center;gap:10px;margin:10px 0 0;padding:12px 14px;\n  clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px));\n  border:1px solid rgba(200,255,46,.25);\n  background:linear-gradient(115deg,rgba(21,28,40,.98),rgba(9,13,19,.98));\n  box-shadow:0 14px 32px rgba(0,0,0,.3);color:var(--fu96-text);\n}\n.fu-v96-console-copy { display:grid;gap:2px; }\n.fu-v96-console-copy strong { font-size:13px;letter-spacing:-.015em; }\n.fu-v96-console-copy small { color:var(--fu96-muted);font-size:10px;line-height:1.4; }\n.fu-v96-kicker { color:var(--fu96-lime);font-size:8px;font-weight:1000;letter-spacing:.21em; }\n.fu-v96-select-wrap { display:grid;grid-template-columns:auto 1fr;align-items:center;gap:7px;color:var(--fu96-muted);font-size:9px;font-weight:950;letter-spacing:.1em;text-transform:uppercase; }\n.fu-v96-select-wrap select { min-height:38px;border:1px solid rgba(62,230,255,.24)!important;border-radius:3px!important;padding:0 28px 0 10px;background:#0b0f16!important;color:var(--fu96-text)!important;font-weight:850; }\n.fu-v96-console button { min-height:38px;padding:7px 10px!important;font-size:10px; }\n.fu-v96-console output { color:#bdc8d9;font-size:9px;font-weight:850;text-align:right; }\n.fu-v96-console output.fail { color:#ff939d; }\n.fu-v96-threat-line { fill:none;stroke:var(--fu96-danger);stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:9 12;filter:drop-shadow(0 0 3px #8b130f); }\n.fu-v96-threat-1 { stroke:var(--fu96-gold);stroke-width:3; }\n.fu-v96-threat-2 { stroke:var(--fu96-blue);stroke-width:2.5; }\n.cpu-auto-tactics { border-color:rgba(200,255,46,.4)!important; }\n.cpu-auto-dot { background:var(--fu96-lime)!important;box-shadow:0 0 0 4px rgba(200,255,46,.13),0 0 13px rgba(200,255,46,.6)!important; }\n.fu-home-nav a { border:1px solid rgba(62,230,255,.2)!important;border-radius:3px!important;background:#0b0f16!important;color:var(--fu96-text)!important; }\n.fu-home-nav a:hover { border-color:var(--fu96-lime)!important;color:var(--fu96-lime)!important; }\n.tournament-result-panel { border-color:rgba(200,255,46,.24)!important;background:#10151f!important; }\n@media(prefers-reduced-motion:no-preference) {\n .board { animation:fu96BoardIn .5s cubic-bezier(.2,.8,.2,1) both; }\n .fu-v96-console { animation:fu96ConsoleIn .38s .1s ease-out both; }\n .player.sel .ring { animation:fu96Selection 1.5s ease-in-out infinite; }\n @keyframes fu96BoardIn { from { opacity:0;transform:translateY(9px) scale(.997); } to { opacity:1;transform:none; } }\n @keyframes fu96ConsoleIn { from { opacity:0;transform:translateY(-4px); } to { opacity:1;transform:none; } }\n @keyframes fu96Selection { 50% { stroke-width:7;opacity:.7; } }\n}\n@media(max-width:980px) {\n .fu-v96-console { grid-template-columns:1fr 220px auto auto; }\n .fu-v96-console output { grid-column:1/-1;text-align:left; }\n .head { display:grid!important; }\n .scoreboard-block { min-width:0; }\n}\n@media(max-width:680px) {\n body { padding:8px!important; }\n .head { padding:10px!important;border-radius:4px!important; }\n .head:after { display:none; }\n .fu-v96-console { grid-template-columns:1fr 1fr;padding:10px; }\n .fu-v96-console-copy,.fu-v96-console output,.fu-v96-select-wrap { grid-column:1/-1; }\n .board { border-radius:4px!important; }\n .match-narrative { display:none; }\n .scoreboard-score b { font-size:10px; }\n}\n@media(max-width:380px) {\n .scoreboard-score { gap:3px!important; }\n .scoreboard-score b { font-size:9px!important; }\n .score { min-width:30px;min-height:34px;font-size:20px; }\n .fu-v96-console { gap:7px; }\n .fu-v96-console button { padding-inline:6px!important;font-size:9px; }\n}\n@media(prefers-reduced-motion:reduce) {\n .board,.fu-v96-console,.player.sel .ring { animation:none!important; }\n button { transition:none!important; }\n}\n\n/* v96.4: la CPU no se puede pausar manualmente en partidos del torneo. */\nbody.tournament-match #cpuToggleBtn { display:none!important; }\n\n/* v96.4: el panel del marcador en móviles no debe cortar la duración ni el estado del turno. */\n@media(max-width:680px) and (orientation:portrait) {\n .board:fullscreen .fullscreen-score-panel,\n .board:-webkit-full-screen .fullscreen-score-panel {\n  display:flex!important;flex-direction:column!important;align-items:stretch!important;\n  height:auto!important;min-height:0!important;\n  max-height:min(176px,30vh)!important;max-height:min(176px,30dvh)!important;\n  overflow-x:hidden!important;overflow-y:auto!important;\n  padding:7px 9px!important;gap:4px!important;scrollbar-width:thin;\n  scrollbar-color:rgba(200,255,46,.45) transparent;\n }\n .fullscreen-score-panel .match-narrative { display:none!important; }\n .fullscreen-score-panel .scoreboard-block { display:flex!important;flex-direction:column!important;gap:5px!important;width:100%!important;min-width:0!important; }\n .fullscreen-score-panel .scoreboard-line {\n  display:flex!important;flex-direction:row!important;align-items:center!important;\n  justify-content:space-between!important;flex-wrap:wrap!important;gap:5px 8px!important;\n }\n .fullscreen-score-panel .scoreboard-score {\n  display:flex!important;flex:0 1 auto!important;align-items:center!important;justify-content:flex-start!important;\n  width:auto!important;min-width:0!important;white-space:normal!important;gap:3px!important;\n }\n .fullscreen-score-panel .scoreboard-score b {\n  max-width:34vw!important;white-space:normal!important;overflow-wrap:anywhere!important;\n  font-size:clamp(8px,2.2vw,11px)!important;line-height:1.15!important;\n }\n .fullscreen-score-panel .score { min-width:24px!important;height:28px!important;padding:0 4px!important;font-size:14px!important; }\n .fullscreen-score-panel .match-clock {\n  display:inline-flex!important;flex:0 1 auto!important;flex-direction:row!important;align-items:center!important;\n  justify-content:flex-start!important;width:auto!important;max-width:100%!important;min-width:0!important;\n  gap:5px!important;margin:0!important;padding:4px 6px!important;border-radius:7px!important;\n }\n .fullscreen-score-panel .match-clock-time { font-size:clamp(15px,4vw,20px)!important; }\n .fullscreen-score-panel .match-clock-state { font-size:clamp(7px,1.8vw,9px)!important;padding:4px 5px!important;white-space:normal!important; }\n .fullscreen-score-panel .match-duration-control { max-width:100%!important;margin:0!important;padding:4px 6px!important;gap:3px 5px!important; }\n .fullscreen-score-panel .match-duration-control select { max-width:120px!important;height:25px!important;font-size:9px!important; }\n .fullscreen-score-panel .match-duration-control small { font-size:8px!important; }\n .fullscreen-score-panel .sub { display:block!important;margin:2px 0 0!important;font-size:10px!important;line-height:1.3!important;white-space:normal!important;overflow-wrap:anywhere!important; }\n}\n\n\n/* Interfaz pública: fuera etiquetas de laboratorio y controles de auditoría. */\n.head:after{content:none!important}\n.info{font-size:11px!important;line-height:1.5!important;color:var(--fu96-muted)!important}\n.fu-v96-console{display:none!important}\n.fu-practice-kit-studio{display:grid;grid-template-columns:minmax(170px,1fr) repeat(2,minmax(220px,1fr));gap:10px;align-items:center;margin-top:8px;padding:10px 12px;border:1px solid rgba(233,238,246,.11);background:rgba(6,8,12,.5);border-radius:4px;color:var(--fu96-text)}\n.fu-kit-heading{display:flex;flex-direction:column;gap:5px}.fu-kit-heading strong{font-size:11px;letter-spacing:.08em;color:var(--fu96-lime)}.fu-kit-heading span{font-size:10px;color:var(--fu96-muted);line-height:1.45}\n.fu-kit-team{display:grid;grid-template-columns:1fr 1fr auto;gap:7px;align-items:end;min-width:0}.fu-kit-team>strong{grid-column:1/-1;font-size:10px;color:#e5edf7;text-transform:uppercase;letter-spacing:.08em}.fu-kit-team label{display:flex;flex-direction:column;gap:4px;min-width:0;font-size:9px;color:var(--fu96-muted)}.fu-kit-team select{width:100%;min-width:0;min-height:34px;padding:5px;font-size:10px!important}.fu-kit-team input[type=color]{width:42px;min-height:34px;height:34px;padding:3px;border:1px solid rgba(233,238,246,.16);background:#090d13}\n@media(max-width:900px){.fu-practice-kit-studio{grid-template-columns:1fr}.fu-kit-team{grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto}}\n@media(max-width:560px){.fu-kit-team{grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto;gap:5px}.fu-kit-team select{font-size:9px!important}.fu-kit-heading span{font-size:11px}}\n";
const V96_SHELL_STYLES = "\n:root {\n  color-scheme: dark;\n  --bg: #06080c;\n  --panel: #10151f;\n  --panel2: #151c28;\n  --line: rgba(233,238,246,.11);\n  --text: #e9eef6;\n  --muted: #8b96a8;\n  --lime: #c8ff2e;\n  --lime2: #8fc400;\n  --cyan: #3ee6ff;\n  --amber: #ffb01f;\n}\nhtml { min-height:100%; scroll-behavior:smooth; background:var(--bg)!important; }\nbody {\n  min-height:100vh!important;\n  color:var(--text)!important;\n  background:\n    radial-gradient(ellipse at 50% -15%,rgba(200,255,46,.09),transparent 48%),\n    radial-gradient(ellipse at 100% 92%,rgba(62,230,255,.055),transparent 35%),\n    repeating-linear-gradient(-55deg,transparent 0 22px,rgba(255,255,255,.012) 22px 23px),\n    var(--bg)!important;\n  font-family:Inter,\"Segoe UI\",system-ui,sans-serif!important;\n}\nbody:before { content:none!important; }\na { color:inherit; }\nbutton:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible { outline:2px solid var(--cyan)!important; outline-offset:3px!important; }\n.wrap { width:min(1380px,calc(100% - 44px))!important; }\n.topbar {\n  position:relative!important;\n  padding:17px 0!important;\n  border-bottom:1px solid rgba(233,238,246,.12)!important;\n  background:transparent!important;\n}\n.topbar:after { content:\"\";position:absolute;bottom:-1px;left:0;width:38%;height:1px;background:linear-gradient(90deg,var(--lime),transparent); }\n.brand-mark,.mark {\n  display:grid!important;place-items:center!important;\n  clip-path:polygon(0 0,78% 0,100% 22%,100% 100%,22% 100%,0 78%)!important;\n  border:0!important;border-radius:0!important;\n  background:linear-gradient(140deg,#ddff70,var(--lime))!important;\n  color:var(--bg)!important;box-shadow:0 0 24px rgba(200,255,46,.14)!important;\n}\n.brand-name { color:var(--text)!important;font-weight:1000!important;letter-spacing:.12em!important; }\n.brand-tag { color:var(--muted)!important;font-size:9px!important;letter-spacing:.2em!important; }\n.top-label,.nav a {\n  border:1px solid rgba(233,238,246,.12)!important;border-radius:4px!important;\n  background:#10151f!important;color:#c4ccda!important;\n  font-size:10px!important;font-weight:900!important;letter-spacing:.11em!important;text-transform:uppercase;\n}\n.nav a { transition:background .16s ease,border-color .16s ease,color .16s ease; }\n.nav a:hover { border-color:rgba(62,230,255,.42)!important;color:var(--cyan)!important;background:rgba(62,230,255,.05)!important; }\n.nav a.active { color:var(--bg)!important;background:var(--lime)!important;border-color:var(--lime)!important; }\n.hero { position:relative;padding:clamp(28px,5vw,64px) 0 clamp(26px,4vw,45px)!important; }\n.hero:after { opacity:.16!important;filter:hue-rotate(35deg); }\n.eyebrow {\n  border:1px solid rgba(200,255,46,.3)!important;border-radius:3px!important;\n  background:rgba(200,255,46,.055)!important;color:var(--lime)!important;\n  font-size:9px!important;font-weight:950!important;letter-spacing:.21em!important;\n}\n.pulse { background:var(--lime)!important;box-shadow:0 0 12px rgba(200,255,46,.7)!important; }\n.hero h1 { font-weight:1000!important;letter-spacing:-.06em!important;line-height:.98!important; }\n.hero h1 span { color:var(--lime)!important;text-shadow:0 0 32px rgba(200,255,46,.1); }\n.hero p { color:#a7b1c2!important;max-width:660px!important; }\n.hero-meta .meta-chip {\n  border:1px solid rgba(233,238,246,.1)!important;border-radius:3px!important;\n  background:rgba(16,21,31,.82)!important;color:#bbc5d3!important;\n  font-size:10px!important;letter-spacing:.03em;\n}\n.section-head h2,.panel h2 { color:var(--text)!important;font-weight:950!important;letter-spacing:-.04em!important; }\n.section-head p,.muted { color:var(--muted)!important; }\n.section-mark { color:var(--cyan)!important;font-size:9px!important;font-weight:850;letter-spacing:.18em!important; }\n.modes { gap:13px!important; }\n.mode {\n  position:relative;border:1px solid rgba(233,238,246,.12)!important;border-radius:5px!important;\n  padding:clamp(16px,2vw,25px)!important;\n  background:linear-gradient(140deg,rgba(21,28,40,.97),rgba(10,14,21,.97))!important;\n  box-shadow:0 20px 42px rgba(0,0,0,.17),inset 0 1px rgba(255,255,255,.025)!important;\n  transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease!important;\n}\n.mode:before { content:\"\";position:absolute;top:0;left:0;width:54px;height:2px;background:rgba(233,238,246,.18); }\n.mode.available { border-color:rgba(200,255,46,.36)!important;background:linear-gradient(140deg,rgba(24,34,43,.98),rgba(10,14,20,.98))!important; }\n.mode.available:before { width:96px;background:linear-gradient(90deg,var(--lime),rgba(200,255,46,0)); }\n.mode.available:hover { transform:translateY(-3px);border-color:var(--lime)!important;box-shadow:0 22px 46px rgba(0,0,0,.28),0 0 28px rgba(200,255,46,.055)!important; }\n.mode.coming { color:var(--text)!important;opacity:.78; }\n.mode-icon {\n  clip-path:polygon(0 0,78% 0,100% 22%,100% 100%,22% 100%,0 78%)!important;\n  border:1px solid rgba(233,238,246,.12)!important;border-radius:0!important;\n  background:#0b0f16!important;color:var(--cyan)!important;\n}\n.mode.available .mode-icon { color:var(--bg)!important;background:var(--lime)!important;border-color:var(--lime)!important; }\n.mode h3 { color:var(--text)!important;font-weight:950!important;letter-spacing:-.045em!important; }\n.mode p { color:#9aa5b8!important; }\n.pill {\n  border:1px solid rgba(233,238,246,.12)!important;border-radius:2px!important;\n  background:#0b0f16!important;color:#aab5c6!important;\n  font-size:8px!important;font-weight:950!important;letter-spacing:.12em!important;\n}\n.mode.available .pill { border-color:rgba(200,255,46,.28)!important;background:rgba(200,255,46,.08)!important;color:var(--lime)!important; }\n.mode-action { color:var(--mist,var(--text))!important; }\n.mode-action .arrow { display:grid;place-items:center;width:27px;height:27px;border:1px solid rgba(233,238,246,.13);color:var(--cyan);background:#0b0f16; }\n.mode.available .mode-action .arrow { color:var(--bg);background:var(--lime);border-color:var(--lime); }\n.bottom-note { color:var(--muted)!important;border-top:1px solid rgba(233,238,246,.1)!important; }\n.dialog-backdrop { background:rgba(2,4,7,.82)!important;backdrop-filter:blur(10px); }\n.dialog { border:1px solid rgba(62,230,255,.24)!important;border-radius:6px!important;background:linear-gradient(145deg,#151c28,#0b0f16)!important;color:var(--text)!important;box-shadow:0 25px 90px #000b!important; }\n\n/* Torneo: mismo sistema visual que la portada. */\n.panel {\n  border:1px solid rgba(233,238,246,.11)!important;border-radius:5px!important;\n  background:linear-gradient(145deg,rgba(16,21,31,.98),rgba(10,14,21,.98))!important;\n  box-shadow:0 18px 38px rgba(0,0,0,.2),inset 0 1px rgba(255,255,255,.025)!important;\n}\n.field-row { gap:clamp(12px,1.5vw,20px)!important; }\ninput[type=search],select,input:not([type]) {\n  border:1px solid rgba(233,238,246,.14)!important;border-radius:3px!important;\n  background:#090d13!important;color:var(--text)!important;\n}\ninput::placeholder { color:#697488!important; }\n.team-card {\n  border:1px solid rgba(233,238,246,.1)!important;border-radius:4px!important;\n  background:#0b0f16!important;color:var(--text)!important;\n  transition:border-color .14s ease,background .14s ease,transform .14s ease!important;\n}\n.team-card:hover { border-color:rgba(62,230,255,.45)!important;background:#121c27!important;transform:translateY(-1px); }\n.team-card.selected { border-color:var(--lime)!important;background:rgba(200,255,46,.08)!important;box-shadow:inset 3px 0 var(--lime),0 0 16px rgba(200,255,46,.05)!important; }\n.team-name { color:var(--text)!important; }\n.team-sub { color:var(--muted)!important; }\n.team-actions button,.btn,button.btn {\n  min-height:40px;border:1px solid rgba(233,238,246,.14)!important;border-radius:3px!important;\n  padding:9px 13px;background:#151c28!important;color:var(--text)!important;\n  font-size:10px!important;font-weight:950!important;letter-spacing:.09em!important;\n  transition:background .15s ease,border-color .15s ease,color .15s ease,transform .15s ease!important;\n}\n.team-actions button:hover,.btn:hover,button.btn:hover { border-color:var(--cyan)!important;color:var(--cyan)!important;transform:translateY(-1px); }\n.team-actions button.primary,.btn.primary,button.btn.primary { border-color:var(--lime)!important;background:var(--lime)!important;color:var(--bg)!important; }\n.team-actions button.primary:hover,.btn.primary:hover,button.btn.primary:hover { border-color:#e4ff9a!important;background:#dcff77!important;color:var(--bg)!important; }\n.notice { border:1px solid rgba(62,230,255,.17)!important;border-radius:4px!important;background:rgba(62,230,255,.035)!important;color:#bbc6d6!important; }\n.stat { border:1px solid rgba(233,238,246,.1)!important;border-radius:4px!important;background:#0b0f16!important; }\n.stat strong { color:var(--lime)!important;font-variant-numeric:tabular-nums; }\n.stat span { color:var(--muted)!important; }\n.table-wrap { border:1px solid rgba(233,238,246,.1)!important;border-radius:4px!important; }\ntable { color:var(--text)!important; }\nthead { background:#161e2a!important;color:var(--cyan)!important; }\nth { color:#a9b5c7!important;font-size:9px!important;letter-spacing:.1em;text-transform:uppercase; }\ntd { border-color:rgba(233,238,246,.07)!important; }\ntbody tr:nth-child(odd) { background:rgba(255,255,255,.018)!important; }\ntbody tr:hover { background:rgba(62,230,255,.045)!important; }\n.fixture,.history-list>*,.fixture-list>* { border-color:rgba(233,238,246,.1)!important;background:#0b0f16!important;border-radius:4px!important; }\n.footer { color:var(--muted)!important;border-color:rgba(233,238,246,.1)!important; }\n@media(max-width:760px) {\n .wrap { width:calc(100% - 24px)!important; }\n .topbar { gap:10px!important;flex-wrap:wrap; }\n .top-label { font-size:8px!important;padding:6px 8px!important; }\n .field-row { grid-template-columns:minmax(0,1fr)!important; }\n .team-grid { grid-template-columns:repeat(2,minmax(0,1fr))!important; }\n .mode { min-height:205px!important; }\n}\n@media(max-width:480px) {\n .wrap { width:calc(100% - 18px)!important; }\n .topbar { align-items:flex-start!important;padding:12px 0!important; }\n .brand-name { font-size:12px!important; }\n .nav { width:100%;display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr)); }\n .nav a { text-align:center;padding:9px 5px!important;font-size:8px!important; }\n .modes { grid-template-columns:minmax(0,1fr)!important; }\n .hero { padding-top:27px!important; }\n .hero p { font-size:13px!important; }\n .section-mark { display:none; }\n .selection-tools { flex-direction:column; }\n .team-grid { grid-template-columns:minmax(0,1fr)!important;max-height:370px!important; }\n .panel { padding:12px!important; }\n}\n@media(prefers-reduced-motion:reduce) {\n html { scroll-behavior:auto!important; }\n *,*:before,*:after { animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important; }\n}\n";
// v97 · Rediseño visual del partido. Capa exclusivamente visual (CSS + JS) que se instala después de v96:
// no modifica reglas, probabilidades, resolución de acciones, cronómetro ni IA.
const V97_MATCH_STYLES = String.raw`
/* ==================== FÚTBOL ÚNICO v97 · REDISEÑO VISUAL DEL PARTIDO ====================
   Se activa sólo cuando la capa JS v97 termina de instalarse (clase html.fu97).
   Todos los selectores parten de .fu97 para no afectar la vista anterior si la capa no se instala. */
html.fu97{
 --k-ink:#05070b;--k-panel:#0d131b;--k-panel-2:#111925;--k-line:rgba(255,255,255,.075);--k-line-2:rgba(255,255,255,.13);
 --k-text:#eef3f8;--k-soft:#c3ccd8;--k-muted:#8b96a8;--k-lime:#c8ff2e;--k-lime-2:#e6ff9a;--k-cyan:#3ee6ff;
 --k-amber:#ffb01f;--k-red:#ff5263;--k-green:#5dffa8;--k-gold:#ffd25a;
 --k-font:"Inter","Segoe UI",Roboto,system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif;
 color-scheme:dark;
}
html.fu97,html.fu97 body{overflow-x:clip!important}
html.fu97 body{
 padding:10px 12px 16px!important;min-height:100dvh;
 background:radial-gradient(ellipse 80% 50% at 50% -10%,rgba(200,255,46,.06),transparent 60%),radial-gradient(ellipse 60% 60% at 100% 100%,rgba(62,230,255,.04),transparent 60%),var(--k-ink)!important;
 font-family:var(--k-font)!important;color:var(--k-text)!important;
}
.fu97 #app.fu97-app{width:min(1720px,100%)!important;max-width:none!important;margin:0 auto!important;--fu97-side-w:340px}

/* ---------------------------------------------------------------- barra superior / marcador */
.fu97 #app .head.fu97-topbar{
 position:relative;display:flex!important;align-items:stretch!important;gap:8px!important;flex-direction:row!important;flex-wrap:nowrap!important;
 margin:0 0 10px!important;padding:7px!important;min-height:0!important;
 border:1px solid var(--k-line)!important;border-radius:16px!important;
 background:linear-gradient(180deg,rgba(21,29,40,.97),rgba(10,14,20,.97))!important;
 box-shadow:0 14px 34px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.05)!important;
}
.fu97 #app .head.fu97-topbar::before,.fu97 #app .head.fu97-topbar::after{content:none!important;display:none!important}
.fu97 #app .fu97-nav{display:flex!important;flex:none;width:auto!important;min-width:0!important;margin:0!important}
.fu97 #app .fu97-nav a{
 display:inline-flex!important;align-items:center;gap:9px;height:100%;min-height:52px;padding:0 15px!important;
 border:1px solid var(--k-line)!important;border-radius:12px!important;background:#0a0f16!important;
 color:var(--k-soft)!important;font:800 11px/1.25 var(--k-font)!important;letter-spacing:.06em!important;text-transform:uppercase;
 max-width:210px;transition:border-color .15s,color .15s,background .15s;
}
.fu97 #app .fu97-nav a:hover{border-color:rgba(200,255,46,.45)!important;color:var(--k-lime-2)!important;background:#0d1520!important}
.fu97 #app .head>div{width:auto!important}
.fu97 #app .fu97-nav .fu-arrow{display:inline-flex;width:18px;height:18px;font-size:0!important;color:var(--k-lime)!important;line-height:1}
.fu97 #app .fu97-nav .fu-arrow svg{width:100%;height:100%}
.fu97 #app .fu97-nav-label{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.fu97 #app .scoreboard-block{display:flex!important;flex:1 1 0!important;min-width:0!important;gap:0!important;margin:0!important}
.fu97 #app .scoreboard-line{display:flex!important;flex:1 1 auto;align-items:stretch!important;gap:8px!important;flex-wrap:nowrap!important;min-width:0;margin:0!important}
.fu97 #app .fu97-scorebug{
 flex:1 1 auto;display:grid!important;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)!important;align-items:stretch!important;
 gap:0!important;min-width:0;height:auto;min-height:52px;margin:0!important;padding:0!important;white-space:nowrap!important;
 border:1px solid var(--k-line)!important;border-radius:12px;overflow:hidden;background:#0a0f16;
}
.fu97 #app .fu97-sb-team{position:relative;display:flex;align-items:center;gap:11px;min-width:0;padding:0 16px}
.fu97 #app .fu97-home{justify-content:flex-end;background:linear-gradient(90deg,rgba(0,0,0,0) 15%,var(--fu97-c1s,rgba(34,102,204,.3)) 100%)}
.fu97 #app .fu97-away{justify-content:flex-start;background:linear-gradient(270deg,rgba(0,0,0,0) 15%,var(--fu97-c2s,rgba(217,60,53,.3)) 100%)}
.fu97 #app .fu97-home::before,.fu97 #app .fu97-away::after{content:"";position:absolute;top:0;bottom:0;width:5px}
.fu97 #app .fu97-home::before{left:0;background:var(--fu97-c1,#2266cc)}
.fu97 #app .fu97-away::after{right:0;background:var(--fu97-c2,#d93c35)}
.fu97 #app .fu97-sb-team b{
 display:block;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
 color:var(--k-text)!important;font:900 14px/1.15 var(--k-font)!important;letter-spacing:.045em!important;text-transform:uppercase;
}
.fu97 #app .fu97-sb-team b.tournament-team-label{display:flex!important;align-items:center;gap:8px}
.fu97 #app .fu97-sb-team .tournament-crest-inline{width:28px!important;height:28px!important;flex:none;object-fit:contain;filter:drop-shadow(0 2px 3px rgba(0,0,0,.5))}
.fu97 #app .fu97-away b.tournament-team-label{flex-direction:row-reverse}
.fu97 #app .fu97-name-full{min-width:0;overflow:hidden;text-overflow:ellipsis}
.fu97 #app .fu97-name-short{display:none}
/* Si los nombres no entran: en Torneo primero se quita la camiseta (queda el escudo); después, siglas en los dos equipos. */
.fu97 #app .fu97-scorebug.fu97-nochip .fu97-kitchip{display:none}
.fu97 #app .fu97-scorebug.fu97-codes .fu97-name-full{display:none}
.fu97 #app .fu97-scorebug.fu97-codes .fu97-name-short{display:inline}
.fu97 #app .fu97-kitchip{flex:none;width:34px;height:34px;filter:drop-shadow(0 3px 4px rgba(0,0,0,.5))}
.fu97 #app .fu97-kitchip svg,.fu97 #app .fu97-kits-preview svg{display:block;width:100%;height:100%}
.fu97 #app .fu97-sb-result{display:flex;align-items:center;justify-content:center;gap:2px;padding:0 6px;background:linear-gradient(180deg,#fbfcfe,#dde3ec);box-shadow:inset 0 -3px 0 rgba(0,0,0,.08)}
.fu97 #app .fu97-sb-result .score{
 display:grid!important;place-items:center!important;min-width:40px!important;height:auto!important;margin:0!important;padding:0 4px!important;
 border:0!important;border-radius:0!important;background:none!important;box-shadow:none!important;
 color:#0a0f16!important;font:950 31px/1 var(--k-font)!important;letter-spacing:-.03em!important;font-variant-numeric:tabular-nums;
}
.fu97 #app .fu97-sb-result .score.fu97-bump{animation:fu97ScoreBump .9s cubic-bezier(.2,.9,.3,1.3)}
.fu97 #app .fu97-sb-sep{color:#7d8899;font:800 20px/1 var(--k-font)}
.fu97 #app .match-clock{
 flex:none;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:4px!important;
 min-width:116px;margin:0!important;padding:6px 14px!important;
 border:1px solid rgba(200,255,46,.24)!important;border-radius:12px!important;background:#0a0f16!important;box-shadow:inset 0 0 22px rgba(200,255,46,.05)!important;
}
.fu97 #app .match-clock-time{font:900 23px/1 var(--k-font)!important;letter-spacing:.01em!important;color:var(--k-lime)!important;font-variant-numeric:tabular-nums;text-shadow:0 0 18px rgba(200,255,46,.25)!important}
.fu97 #app .match-clock-state{
 justify-self:auto!important;align-self:center!important;max-width:150px;padding:2px 8px!important;
 border:1px solid rgba(200,255,46,.22)!important;border-radius:999px!important;background:rgba(200,255,46,.07)!important;
 color:var(--k-lime-2)!important;font:850 9px/1.4 var(--k-font)!important;letter-spacing:.1em!important;white-space:nowrap!important;overflow:hidden;text-overflow:ellipsis;
}
.fu97 #app .match-clock-side,.fu97 #app .match-clock-label,.fu97 #app .match-clock-hint{display:none!important}
.fu97 #app .match-clock.fu97-clock-break{border-color:rgba(62,230,255,.4)!important}
.fu97 #app .match-clock.fu97-clock-break .match-clock-time{color:var(--k-cyan)!important}
.fu97 #app .match-clock.fu97-clock-final{border-color:rgba(255,82,99,.45)!important}
.fu97 #app .match-clock.fu97-clock-final .match-clock-state{border-color:rgba(255,82,99,.4)!important;background:rgba(255,82,99,.12)!important;color:#ffc2c8!important}
.fu97 #app .fu97-turnbox{
 --fu97-turn-c:var(--k-lime);flex:none;display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;align-content:center;column-gap:10px;row-gap:6px;
 min-width:190px;padding:7px 14px;border:1px solid var(--k-line);border-radius:12px;background:#0a0f16;
}
.fu97 #app .fu97-turnbox[data-team="2"]{--fu97-turn-c:var(--k-amber)}
.fu97 #app .fu97-turn-badge{grid-column:1/3;justify-self:start;padding:4px 10px 3px;border-radius:7px;background:var(--k-lime);color:#081002;font:950 12px/1.2 var(--k-font);letter-spacing:.1em;white-space:nowrap;box-shadow:0 0 18px rgba(200,255,46,.25)}
.fu97 #app .fu97-turnbox.is-cpu .fu97-turn-badge{background:var(--k-amber);color:#1d1100;box-shadow:0 0 18px rgba(255,176,31,.28)}
.fu97 #app .fu97-turnbox.is-thinking .fu97-turn-badge::after{content:"…"}
.fu97 #app .fu97-turnbox.is-manual .fu97-turn-badge{background:var(--k-cyan);color:#001318}
.fu97 #app .fu97-turnbox.is-break .fu97-turn-badge{background:#9fb1c8;color:#08101a;box-shadow:none}
.fu97 #app .fu97-turnbox.is-final .fu97-turn-badge{background:var(--k-red);color:#fff;box-shadow:0 0 18px rgba(255,82,99,.3)}
.fu97 #app .fu97-turnbox.is-goal .fu97-turn-badge{background:var(--k-gold);color:#241800}
.fu97 #app .fu97-pips{display:flex;align-items:center;gap:5px}
.fu97 #app .fu97-pips i{width:20px;height:6px;border-radius:3px;background:rgba(255,255,255,.13)}
.fu97 #app .fu97-pips i.is-done{background:var(--fu97-turn-c);opacity:.55}
.fu97 #app .fu97-pips i.is-now{background:var(--fu97-turn-c);box-shadow:0 0 10px var(--fu97-turn-c)}
.fu97 #app .fu97-turn-sub{align-self:center;color:var(--k-muted);font:750 10px/1.2 var(--k-font);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px}
.fu97 #app .fu97-turn-sub.fu97-off{display:none}

/* ---------------------------------------------------------------- cuerpo: cancha + panel lateral */
.fu97 #app .fu97-main{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;align-items:start}
.fu97 #app .fu97-pitchcol{min-width:0;display:flex;flex-direction:column;gap:10px}
.fu97 #app .fu97-side{min-width:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,290px),1fr));gap:10px;align-content:start}
@media (min-width:1100px){
 .fu97 #app .fu97-main{grid-template-columns:minmax(0,1fr) var(--fu97-side-w)}
 .fu97 #app .fu97-main{align-items:stretch}
 .fu97 #app .fu97-side{display:flex;flex-direction:column;align-self:stretch;contain:size;min-height:320px;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#2a3442 transparent;padding-right:2px}
}
@media (min-width:1500px){.fu97 #app.fu97-app{--fu97-side-w:360px}}
@media (min-width:700px) and (max-width:1099.98px) and (orientation:landscape){
 .fu97 #app.fu97-app{--fu97-side-w:290px}
 .fu97 #app .fu97-main{grid-template-columns:minmax(0,1fr) var(--fu97-side-w)}
 .fu97 #app .fu97-main{align-items:stretch}
 .fu97 #app .fu97-side{display:flex;flex-direction:column;align-self:stretch;contain:size;min-height:300px;overflow:auto;scrollbar-width:thin}
}

/* ---------------------------------------------------------------- tablero y cancha */
.fu97 #app .board{
 position:relative;display:flex!important;flex-direction:column!important;gap:8px;
 width:var(--fu97-board-w,100%)!important;max-width:100%!important;min-width:0;margin:0 auto!important;padding:8px!important;
 border:1px solid var(--k-line)!important;border-radius:18px!important;overflow:visible!important;filter:none!important;
 background:linear-gradient(180deg,#121a24,#090d13)!important;
 box-shadow:0 22px 50px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.05)!important;animation:fu97BoardIn .45s cubic-bezier(.2,.8,.2,1) backwards;
}
.fu97 #app .board::before,.fu97 #app .board::after{content:none!important;display:none!important}
.fu97 #app.match-finished .board{filter:none!important}
.fu97 #app .fu97-pitchframe{position:relative;min-width:0;border-radius:12px;overflow:hidden;background:#17482a;box-shadow:0 0 0 1px rgba(255,255,255,.07),0 10px 26px rgba(0,0,0,.4)}
.fu97 #app .board .pitch-scroll-area{position:relative!important;display:block!important;width:100%!important;max-width:100%!important;height:auto!important;margin:0!important;overflow:hidden;border-radius:0!important;z-index:1!important}
.fu97 #app .board:not(.fu97-vertical):not(.fu97-zoom) .pitch-scroll-area #field{
 display:block!important;width:100%!important;min-width:0!important;max-width:100%!important;height:auto!important;max-height:none!important;
 margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;transform:none!important;
}
.fu97 #app .board.fu97-zoom .pitch-scroll-area{overflow-x:auto!important;overflow-y:hidden!important;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:#3a4a3c #0b1015}
.fu97 #app .board.fu97-zoom .pitch-scroll-area #field{border:0!important;border-radius:0!important;box-shadow:none!important}
.fu97 #app .board.fu97-vertical .pitch-scroll-area{container-type:inline-size;aspect-ratio:1160/1990;overflow:hidden!important;overflow:clip!important}
.fu97 #app .board.fu97-vertical .pitch-scroll-area #field{
 position:absolute!important;left:50%!important;top:50%!important;display:block!important;
 width:calc(var(--fu97-cw,100cqw)*1990/1160)!important;height:var(--fu97-cw,100cqw)!important;
 min-width:0!important;max-width:none!important;min-height:0!important;max-height:none!important;margin:0!important;
 border:0!important;border-radius:0!important;box-shadow:none!important;
 transform:translate(-50%,-50%) rotate(-90deg)!important;transform-origin:50% 50%!important;
}
.fu97 #app .mobile-pitch-hint{display:none!important}
.fu97 #app .board.fu97-zoom~.mobile-pitch-hint{display:block!important;margin:-2px 4px 0!important;color:var(--k-muted)!important;font:700 11px/1.4 var(--k-font)!important;text-align:center}

/* repetición del gol */
.fu97 #app .fu97-pitchframe::before,.fu97 #app .fu97-pitchframe::after{content:"";position:absolute;left:0;right:0;height:0;z-index:4;background:#000;transition:height .35s ease;pointer-events:none}
.fu97 #app .fu97-pitchframe::before{top:0}
.fu97 #app .fu97-pitchframe::after{bottom:0}
.fu97 #app .board.fu97-replay .fu97-pitchframe::before,.fu97 #app .board.fu97-replay .fu97-pitchframe::after{height:7%}
.fu97 #app .fu97-replay-tag{position:absolute;z-index:5;top:calc(7% + 10px);left:12px;display:flex;align-items:center;gap:8px;padding:6px 12px;border-radius:8px;background:rgba(5,8,12,.82);border:1px solid rgba(255,210,90,.5);color:var(--k-gold);font:950 11px/1 var(--k-font);letter-spacing:.2em;opacity:0;transform:translateY(-6px);transition:opacity .25s,transform .25s;pointer-events:none}
.fu97 #app .fu97-replay-tag i{width:8px;height:8px;border-radius:50%;background:var(--k-red);box-shadow:0 0 10px var(--k-red)}
.fu97 #app .board.fu97-replay .fu97-replay-tag{opacity:1;transform:none}

/* ---------------------------------------------------------------- SVG: césped, líneas y arcos */
/* La textura v97 ya trae su color final: el filtro CSS de la foto anterior se desactiva
   (combinado con una imagen grande obliga a re-rasterizar toda la cancha en cada cuadro). */
/* Fondo estático (textura, líneas y arcos) en su propia capa: se rasteriza una vez y no se
   vuelve a pintar cuando se mueven fichas, balón o guías. */
.fu97 #field #pitchTexture,.fu97 #field #grass{will-change:transform}
/* Fichas y balón en capas propias: moverlos no obliga a repintar césped, casillas ni paneles. */
.fu97 #field #players,.fu97 #field #ball{will-change:transform}
.fu97 #field #gL,.fu97 #field #gR{fill:transparent!important;stroke:none!important;cursor:default}
.fu97 #field #gL.active,.fu97 #field #gR.active{cursor:pointer}
.fu97 #field #gL.fu97-target,.fu97 #field #gR.fu97-target{fill:rgba(255,210,90,.15)!important;stroke:#ffe08a!important;stroke-width:3.5!important;stroke-dasharray:12 8}
.fu97 #field .cell{fill:transparent!important;stroke:rgba(255,255,255,.05)!important;stroke-width:1!important;transition:fill .12s ease}
.fu97 #field .cell.goal{fill:transparent!important;stroke:rgba(255,255,255,.05)!important}
.fu97 #field .cell.pl{fill:url(#fu97MoveDot)!important;stroke:rgba(200,255,46,.3)!important;stroke-width:1.5!important;cursor:pointer}
.fu97 #field .cell.pl.duel{fill:url(#fu97DuelMark)!important;stroke:rgba(255,154,60,.85)!important;stroke-width:3!important}
.fu97 #field .cell.sel{fill:rgba(200,255,46,.07)!important;stroke:rgba(200,255,46,.75)!important;stroke-width:3!important}
.fu97 #field .cell.fu97-reach{cursor:crosshair}
.fu97 #field .cell.advisor-target{fill:rgba(62,230,255,.16)!important;stroke:var(--k-cyan)!important;stroke-width:3!important}
@media (hover:hover) and (pointer:fine){
 .fu97 #field .cell.pl:hover{fill:rgba(200,255,46,.24)!important;stroke:#eaffb5!important;stroke-width:3!important}
 .fu97 #field .cell.pl.duel:hover{fill:rgba(255,138,31,.35)!important;stroke:#ffd0a0!important}
 .fu97 #field .cell.fu97-reach:hover{fill:rgba(62,230,255,.16)!important;stroke:rgba(111,240,255,.85)!important;stroke-width:2.5!important}
}
.fu97 #field .ballTrail,.fu97 #field #ballTrail{display:none!important}
.fu97 #field #fuV96ThreatLayer{opacity:.75}

/* ---------------------------------------------------------------- fichas */
.fu97 #field .player{cursor:pointer;filter:none!important;transition:none!important}
.fu97 #field .player:hover,.fu97 #field .player.sel,.fu97 #field .player.fu-v963-action-focus{filter:none!important}
.fu97 #field .fu97-tk{--fu97-sel:var(--k-lime)}
.fu97 #field .fu97-tk.fu97-t2{--fu97-sel:var(--k-amber)}
.fu97 #field .fu97-tk-shadow{fill:url(#fu97GroundShadow)}
.fu97 #field .fu97-tk-halo{fill:var(--fu97-sel);fill-opacity:0}
.fu97 #field .fu97-tk-sel{fill:none;stroke:var(--fu97-sel);stroke-width:4.5;stroke-dasharray:15 9;stroke-linecap:round;stroke-opacity:0}
.fu97 #field .fu97-tk-must{fill:none;stroke:#ffffff;stroke-width:3.5;stroke-dasharray:6 7;stroke-linecap:round;stroke-opacity:0}
.fu97 #field .fu97-tk-rim{stroke:rgba(0,0,0,.5);stroke-width:1.6}
.fu97 #field .fu97-tk-base{stroke:rgba(0,0,0,.18);stroke-width:1}
.fu97 #field .fu97-tk-collar{fill:none;stroke-width:3.4;stroke-linecap:round}
.fu97 #field .fu97-tk-gk{stroke-width:2.4;stroke-dasharray:5 4;opacity:.75}
.fu97 #field .fu97-tk-shade,.fu97 #field .fu97-tk-gloss,.fu97 #field .fu97-tk-kit{pointer-events:none}
.fu97 #field .fu97-tk-num{font:900 26px/1 var(--k-font);text-anchor:middle;letter-spacing:-.05em;stroke-width:3.6px;paint-order:stroke fill;stroke-linejoin:round;pointer-events:none}
.fu97 #field .fu97-tk-done{display:none;pointer-events:none}
.fu97 #field .fu97-tk-done circle{fill:#0b121b;stroke:var(--fu97-sel);stroke-width:2}
.fu97 #field .fu97-tk-done path{fill:none;stroke:var(--fu97-sel);stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
.fu97 #field .player.sel .fu97-tk-sel{stroke-opacity:1}
.fu97 #field .player.sel .fu97-tk-halo{fill-opacity:.2}
.fu97 #field .player.fu97-carrier:not(.sel) .fu97-tk-halo{fill-opacity:.1;fill:#ffffff}
.fu97 #field .player.fu-v963-action-focus .fu97-tk-halo{fill-opacity:.3}
.fu97 #field .player.fu97-must .fu97-tk-must{stroke-opacity:.95}
.fu97 #field .player.fu97-acted .fu97-tk-body{opacity:.42}
.fu97 #field .player.fu97-acted .fu97-tk-shadow{fill-opacity:.5}
.fu97 #field .player.fu97-acted .fu97-tk-done{display:inline}
.fu97 #field .player.advisor-player .fu97-tk-sel{stroke-opacity:1;stroke:var(--k-cyan)}
@media (hover:hover) and (pointer:fine){
 .fu97 #field .player:hover .fu97-tk-halo{fill-opacity:.28}
}

/* ---------------------------------------------------------------- balón */
.fu97 #field .fu97-ball{pointer-events:none}
.fu97 #field .fu97-ball-shadow{fill:url(#fu97GroundShadow)}
.fu97 #field .fu97-ball-panel{fill:#151a1d;stroke:#3a4247;stroke-width:.5}
.fu97 #field .fu97-ball-seam{stroke:#8b9499;stroke-width:.8;stroke-linecap:round}
.fu97 #field .fu97-ball-edge{fill:none;stroke:rgba(10,20,15,.6);stroke-width:1.1}
.fu97 #field .fu97-ball-glint{fill:#ffffff;opacity:.7}

/* ---------------------------------------------------------------- guía táctica */
.fu97 #field .fu97-zone{stroke:none;fill-opacity:.1}
.fu97 #field .fu97-zone.is-p5{fill:#5dffa8;fill-opacity:.15}
.fu97 #field .fu97-zone.is-p4{fill:#c8ff2e;fill-opacity:.11}
.fu97 #field .fu97-zone.is-p3{fill:#ffe066;fill-opacity:.08}
.fu97 #field .fu97-zone.is-p2{fill:#ffa04a;fill-opacity:.06}
.fu97 #field .fu97-zone.is-p1{fill:#ff5d6c;fill-opacity:.06}
.fu97 #field .fu97-zone-edge{fill:none;stroke-width:3;stroke-dasharray:3 9;stroke-linecap:round;stroke-opacity:.75}
.fu97 #field .fu97-zone-edge.is-p5{stroke:#5dffa8}
.fu97 #field .fu97-zone-edge.is-p4{stroke:#c8ff2e}
.fu97 #field .fu97-zone-edge.is-p3{stroke:#ffe066}
.fu97 #field .fu97-zone-edge.is-p2{stroke:#ffa04a}
.fu97 #field .fu97-zone-edge.is-p1{stroke:#ff5d6c}
.fu97 #field .fu97-lane{fill:none;stroke-width:3.2;stroke-linecap:round;stroke-dasharray:3 11;opacity:.75}
.fu97 #field .fu97-lane.is-free{stroke:var(--k-green)}
.fu97 #field .fu97-lane.is-risk{stroke:#ffc04a}
.fu97 #field .fu97-lane.is-blocked,.fu97 #field .fu97-lane.is-offside{stroke:#ff6b78;opacity:.45}
.fu97 #field .fu97-rcv circle{fill:none;stroke-width:4.5}
.fu97 #field .fu97-rcv.is-free>circle{stroke:var(--k-green)}
.fu97 #field .fu97-rcv.is-risk>circle{stroke:#ffc04a;stroke-dasharray:10 6}
.fu97 #field .fu97-rcv.is-blocked>circle,.fu97 #field .fu97-rcv.is-offside>circle{stroke:#ff5d6c;stroke-opacity:.9}
.fu97 #field .fu97-rcv-icon circle{fill:#ff5d6c!important;stroke:#2a0b10!important;stroke-width:2!important}
.fu97 #field .fu97-rcv-icon path{fill:none;stroke:#fff;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
.fu97 #field .fu97-pill rect{fill:rgba(6,10,15,.88);stroke-width:2}
.fu97 #field .fu97-pill text{font:900 17px/1 var(--k-font);letter-spacing:.05em;fill:#f2f6fa}
.fu97 #field .fu97-rcv-pill.is-free rect{stroke:rgba(93,255,168,.75)}
.fu97 #field .fu97-rcv-pill.is-free text{fill:#b9ffd8}
.fu97 #field .fu97-rcv-pill.is-free.is-p3 text,.fu97 #field .fu97-rcv-pill.is-free.is-p2 text{fill:#ffe9b0}
.fu97 #field .fu97-rcv-pill.is-free.is-p1 text{fill:#ffc2c8}
.fu97 #field .fu97-rcv-pill.is-risk rect{stroke:rgba(255,192,74,.8)}
.fu97 #field .fu97-rcv-pill.is-risk text{fill:#ffe1a6}
.fu97 #field .fu97-rcv-pill.is-blocked rect,.fu97 #field .fu97-rcv-pill.is-offside rect{stroke:rgba(255,93,108,.8)}
.fu97 #field .fu97-rcv-pill.is-blocked text,.fu97 #field .fu97-rcv-pill.is-offside text{fill:#ffc2c8}
.fu97 #field .fu97-rcv-pill{opacity:.95}
/* Decoraciones de pase y remate: sólo informan. Los clics tienen que llegar a la casilla o a la ficha de abajo,
   que son las que el motor escucha (onCell / clickP). */
.fu97 #field .fu97-zones,.fu97 #field .fu97-lanes,.fu97 #field .fu97-receivers,.fu97 #field .fu97-shots{pointer-events:none}
.fu97 #field .fu97-shot{stroke-width:4;stroke-linecap:round;stroke-dasharray:1 12;opacity:.9}
.fu97 #field .fu97-shot.is-none{stroke:#ff8a95;opacity:.5}
.fu97 #field .fu97-shot.is-low{stroke:#ffb35c}
.fu97 #field .fu97-shot.is-mid{stroke:#ffe066}
.fu97 #field .fu97-shot.is-high{stroke:#c8ff2e;stroke-width:5}
.fu97 #field .fu97-shot-end{stroke-width:3.5;fill:rgba(6,10,15,.55)}
.fu97 #field .fu97-shot-end.is-none{stroke:#ff8a95}
.fu97 #field .fu97-shot-end.is-low{stroke:#ffb35c}
.fu97 #field .fu97-shot-end.is-mid{stroke:#ffe066}
.fu97 #field .fu97-shot-end.is-high{stroke:#c8ff2e;fill:rgba(200,255,46,.22)}
.fu97 #field .fu97-shot-pill rect{stroke-width:2.4}
.fu97 #field .fu97-shot-pill text{font-size:20px}
.fu97 #field .fu97-shot-pill.is-none rect{stroke:rgba(255,138,149,.7)}
.fu97 #field .fu97-shot-pill.is-none text{fill:#ffc2c8}
.fu97 #field .fu97-shot-pill.is-low rect{stroke:#ffb35c}
.fu97 #field .fu97-shot-pill.is-mid rect{stroke:#ffe066}
.fu97 #field .fu97-shot-pill.is-high rect{stroke:#c8ff2e;fill:rgba(28,40,6,.92)}
.fu97 #field .fu97-shot-pill.is-high text{fill:#eaffb5}
/* vista previa (escritorio) */
.fu97 #field .fu97-pv-move{stroke:#e6ff9a;stroke-width:5;stroke-linecap:round;stroke-dasharray:9 9}
.fu97 #field .fu97-pv-move.is-duel{stroke:#ff9a3c}
.fu97 #field .fu97-pv-ghost{fill:rgba(200,255,46,.1);stroke:#e6ff9a;stroke-width:3;stroke-dasharray:6 6}
.fu97 #field .fu97-pv-pass{fill:none;stroke:#6ff0ff;stroke-width:5;stroke-linecap:round;stroke-dasharray:10 9}
.fu97 #field .fu97-pv-pass.is-p5,.fu97 #field .fu97-pv-pass.is-p4{stroke:#6ff0ff}
.fu97 #field .fu97-pv-pass.is-p3{stroke:#ffe066}
.fu97 #field .fu97-pv-pass.is-p2{stroke:#ffb35c}
.fu97 #field .fu97-pv-pass.is-p1{stroke:#ff8a95}
.fu97 #field .fu97-pv-pass.is-blocked{stroke:#ff5d6c}
.fu97 #field .fu97-pv-pass.is-goal{stroke:#ffe08a}
.fu97 #field .fu97-pv-target{fill:rgba(111,240,255,.18);stroke:#6ff0ff;stroke-width:3}
.fu97 #field .fu97-pv-target.is-p3{fill:rgba(255,224,102,.2);stroke:#ffe066}
.fu97 #field .fu97-pv-target.is-p2{fill:rgba(255,179,92,.2);stroke:#ffb35c}
.fu97 #field .fu97-pv-target.is-p1{fill:rgba(255,138,149,.18);stroke:#ff8a95}
.fu97 #field .fu97-pv-target.is-goal{fill:rgba(255,224,138,.22);stroke:#ffe08a}
.fu97 #field .fu97-pv-target.is-blocked{fill:rgba(255,93,108,.25);stroke:#ff5d6c}
.fu97 #field .fu97-pv-threat{fill:none;stroke:#ffc04a;stroke-width:4;stroke-dasharray:6 5}
.fu97 #field .fu97-pv-threat.is-blocked{stroke:#ff5d6c}
.fu97 #field .fu97-pv-pill rect{stroke:#e6ff9a}
.fu97 #field .fu97-pv-pill.is-duel rect{stroke:#ff9a3c}
.fu97 #field .fu97-pv-pill.is-p5 rect,.fu97 #field .fu97-pv-pill.is-p4 rect{stroke:#6ff0ff}
.fu97 #field .fu97-pv-pill.is-p3 rect{stroke:#ffe066}
.fu97 #field .fu97-pv-pill.is-p2 rect{stroke:#ffb35c}
.fu97 #field .fu97-pv-pill.is-p1 rect,.fu97 #field .fu97-pv-pill.is-blocked rect{stroke:#ff5d6c}
.fu97 #field .fu97-pv-pill.is-goal rect{stroke:#ffe08a}
/* huellas, estelas y efectos */
.fu97 #field .fu97-ghost{stroke-width:4;stroke-linecap:round;stroke-dasharray:4 10;stroke-opacity:.6}
.fu97 #field .fu97-ghost.is-persist{stroke-opacity:.72}
.fu97 #field .fu97-ghost-step circle{fill:rgba(8,12,18,.92);stroke:#ffc04a;stroke-width:2.6}
.fu97 #field .fu97-ghost-step text{font:950 17px/1 var(--k-font);fill:#ffe1a6}
.fu97 #app .board.fu97-anim #field .cell.pl,.fu97 #app .board.fu97-anim #field .cell.sel,.fu97 #app .board.fu97-anim #field .cell.fu97-reach{fill:transparent!important;stroke:rgba(255,255,255,.05)!important;stroke-width:1!important}
.fu97 #app .board.fu97-anim #field #gL.fu97-target,.fu97 #app .board.fu97-anim #field #gR.fu97-target{fill:transparent!important;stroke:none!important}
.fu97 #field .fu97-ghost-t1{stroke:#d8ff6a}
.fu97 #field .fu97-ghost-t2{stroke:#ffc04a}
.fu97 #field .fu97-streak{fill-opacity:.28;transition:fill-opacity .3s ease}
.fu97 #field .fu97-streak.is-out,.fu97 #field .fu97-trail.is-out{fill-opacity:0}
.fu97 #field .fu97-trail{fill:#ffffff;fill-opacity:.55;transition:fill-opacity .2s ease}
.fu97 #field .fu97-trail.is-hot{fill:#ffe08a;fill-opacity:.75}
.fu97 #field .fu97-dust circle{fill-opacity:0}
.fu97 #field .fu97-spark line{stroke-width:3.5;stroke-linecap:round}
.fu97 #field .fu97-badge-fx rect{fill:rgba(6,10,15,.9);stroke-width:2.5}
.fu97 #field .fu97-badge-fx text{font:950 21px/1 var(--k-font);letter-spacing:.08em}
.fu97 #field .fu97-badge-fx.is-save rect{stroke:#6ff0ff}
.fu97 #field .fu97-badge-fx.is-save text{fill:#c9f9ff}
.fu97 #field .fu97-badge-fx.is-miss rect{stroke:#ff8a95}
.fu97 #field .fu97-badge-fx.is-miss text{fill:#ffd0d5}
.fu97 #app .board.fu97-vertical .fu97-pv-pill{display:none}
.fu97 #app .board.fu97-vertical .fu97-pill text{font-size:24px}
.fu97 #app .board.fu97-vertical .fu97-pill rect{stroke-width:2.6}

/* ---------------------------------------------------------------- barra de acción */
.fu97 #app .fu97-actionbar{
 display:grid;grid-template-columns:minmax(200px,auto) minmax(0,1fr) auto;align-items:center;gap:10px;min-width:0;
 padding:7px;border:1px solid var(--k-line);border-radius:13px;background:rgba(7,11,16,.92);
}
.fu97 #app .fu97-ab-player{display:flex;align-items:center;gap:10px;min-width:0;padding:4px 12px 4px 5px;border-radius:10px;background:var(--k-panel-2);border:1px solid var(--k-line)}
.fu97 #app .fu97-ab-token{flex:none;width:38px;height:38px;color:#4c5a6d}
.fu97 #app .fu97-ab-token svg{display:block;width:100%;height:100%}
.fu97 #app .fu97-mini-num{font:900 26px/1 var(--k-font);letter-spacing:-.05em;stroke-width:3.6px;paint-order:stroke fill;stroke-linejoin:round}
.fu97 #app .fu97-ab-text{display:grid;gap:2px;min-width:0}
.fu97 #app .fu97-ab-text strong{color:var(--k-text);font:900 13px/1.2 var(--k-font);letter-spacing:.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fu97 #app .fu97-ab-text small{color:var(--k-muted);font:700 11px/1.25 var(--k-font);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fu97 #app .fu97-ab-msg{position:relative;display:flex;align-items:center;gap:8px;min-width:0;min-height:46px;padding:5px 12px;border-radius:10px;border:1px solid transparent;background:rgba(255,255,255,.025);transition:border-color .2s,background .2s}
.fu97 #app .fu97-ab-msg #msg{
 flex:1 1 auto;min-width:0;min-height:0!important;margin:0!important;padding:0!important;border:0!important;background:none!important;
 color:var(--k-soft)!important;font:650 12.5px/1.45 var(--k-font)!important;
 display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
}
.fu97 #app .fu97-ab-msg.is-open #msg{display:block;-webkit-line-clamp:unset;overflow:visible}
.fu97 #app .fu97-ab-msg.is-flash{animation:fu97MsgFlash .7s ease-out}
.fu97 #app .fu97-ab-msg.is-warn{border-color:rgba(255,176,31,.4);background:rgba(255,176,31,.07)}
.fu97 #app .fu97-ab-msg.is-warn #msg{color:#ffe0a6!important}
.fu97 #app .fu97-ab-msg.is-event{border-color:rgba(62,230,255,.35);background:rgba(62,230,255,.06)}
.fu97 #app .fu97-ab-msg.is-event #msg{color:#d6f9ff!important}
.fu97 #app .fu97-msg-more{flex:none;align-self:flex-end;padding:3px 8px;border:1px solid var(--k-line-2);border-radius:999px;background:transparent;color:var(--k-muted);font:800 10px/1.2 var(--k-font);letter-spacing:.04em;cursor:pointer}
.fu97 #app .fu97-msg-more:hover{color:var(--k-text);border-color:rgba(255,255,255,.3)}
.fu97 #app .fu97-ab-tools{flex:none;display:flex;align-items:stretch;gap:6px}
.fu97 #app .fu97-ab-tools .fu97-tool{height:auto!important;min-height:44px!important}
.fu97 #app .fu97-tool{
 position:static!important;inset:auto!important;transform:none!important;display:inline-flex!important;align-items:center;justify-content:center;gap:6px;
 width:auto!important;min-width:46px!important;height:46px!important;min-height:46px!important;margin:0!important;padding:0 12px!important;
 border:1px solid var(--k-line-2)!important;border-radius:11px!important;background:var(--k-panel-2)!important;color:var(--k-soft)!important;
 font:800 11px/1 var(--k-font)!important;letter-spacing:.04em;opacity:1!important;box-shadow:none!important;cursor:pointer;
 backdrop-filter:none!important;-webkit-backdrop-filter:none!important;
}
.fu97 #app .fu97-tool[hidden]{display:none!important}
.fu97 #app .fu97-tool:hover{border-color:rgba(62,230,255,.45)!important;color:var(--k-text)!important}
.fu97 #app .fu97-tool svg{width:20px;height:20px;flex:none}
.fu97 #app .fu97-tool .fs-icon{display:flex;font-size:0!important}
.fu97 #app .fu97-actionbar #ballModeControl{
 position:relative!important;inset:auto!important;transform:none!important;display:inline-flex!important;flex-direction:row!important;align-items:center!important;justify-content:center!important;gap:10px!important;
 width:auto!important;min-width:150px;height:52px!important;min-height:52px!important;margin:0!important;padding:0 18px 0 8px!important;
 border:1.5px solid rgba(200,255,46,.6)!important;border-radius:13px!important;background:linear-gradient(180deg,#1b2a0d,#0f1808)!important;
 color:var(--k-lime-2)!important;box-shadow:0 8px 20px rgba(0,0,0,.35)!important;opacity:1!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;
 cursor:pointer;transition:background .15s,border-color .15s,transform .15s;
}
.fu97 #app .fu97-actionbar #ballModeControl:not(:disabled):not(.active){box-shadow:0 0 0 3px rgba(200,255,46,.14),0 8px 20px rgba(0,0,0,.35)!important}
.fu97 #app .fu97-actionbar #ballModeControl[hidden]{display:inline-flex!important}
.fu97 #app .fu97-actionbar #ballModeControl:disabled{border-color:var(--k-line-2)!important;background:var(--k-panel-2)!important;color:#5d687a!important;box-shadow:none!important;cursor:not-allowed}
.fu97 #app .fu97-actionbar #ballModeControl:disabled .ball-fab-icon{opacity:.35;filter:grayscale(1)}
.fu97 #app .fu97-actionbar #ballModeControl:not(:disabled):hover{transform:translateY(-1px);border-color:var(--k-lime)!important}
.fu97 #app .fu97-actionbar #ballModeControl.active{background:var(--k-lime)!important;border-color:var(--k-lime)!important;color:#091200!important;box-shadow:0 0 22px rgba(200,255,46,.35)!important}
.fu97 #app .fu97-actionbar .ball-fab-icon{width:36px!important;height:36px!important;flex:none;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))}
.fu97 #app .fu97-actionbar .ball-fab-label{display:block!important;position:static!important;transform:none!important;font:950 13px/1 var(--k-font)!important;letter-spacing:.1em!important;color:inherit!important;background:none!important;padding:0!important;border:0!important;box-shadow:none!important;white-space:nowrap}

/* ---------------------------------------------------------------- panel lateral */
.fu97 #app .fu97-card{min-width:0;margin:0;padding:12px 14px;border:1px solid var(--k-line);border-radius:14px;background:linear-gradient(180deg,rgba(17,24,34,.96),rgba(11,16,23,.96));box-shadow:0 10px 26px rgba(0,0,0,.28)}
.fu97 #app .fu97-card-title{display:flex;align-items:center;gap:8px;margin:0 0 10px;color:var(--k-soft);font:900 11px/1.2 var(--k-font);letter-spacing:.14em;text-transform:uppercase}
.fu97 #app .fu97-card-title svg{width:16px;height:16px;flex:none;color:var(--k-lime)}
.fu97 #app .fu97-card-status #turn{display:block!important;margin:0 0 8px!important;padding:0!important;color:var(--k-text)!important;font:750 13px/1.45 var(--k-font)!important;white-space:normal!important}
.fu97 #app .fu97-card-status #state{display:flex!important;align-items:center;gap:8px;margin:0 0 8px!important;padding:8px 10px!important;border-radius:9px;background:rgba(255,255,255,.035);border:1px solid var(--k-line);color:var(--k-soft)!important;font:700 12px/1.35 var(--k-font)!important}
.fu97 #app .fu97-card-status #state::before{content:"";width:14px;height:14px;flex:none;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff 0 35%,#cfd6d2 70%,#8e9893 100%);box-shadow:0 1px 2px rgba(0,0,0,.5)}
.fu97 #app .fu97-card-status #cpuStatus{margin:0!important;padding:8px 10px!important;border-radius:9px!important;border:1px solid rgba(93,255,168,.2)!important;background:rgba(93,255,168,.06)!important;color:#bdf5d4!important;font:700 11.5px/1.45 var(--k-font)!important}
.fu97 #app .fu97-card-status #cpuStatus.thinking{border-color:rgba(255,176,31,.35)!important;background:rgba(255,176,31,.08)!important;color:#ffe0a6!important}
.fu97 #app .fu97-card-status #cpuStatus.paused{border-color:rgba(255,82,99,.35)!important;background:rgba(255,82,99,.08)!important;color:#ffc2c8!important}
.fu97 #app .fu97-legend{display:grid;grid-template-columns:1fr 1fr;gap:8px 10px;margin:0;padding:0;list-style:none}
.fu97 #app .fu97-legend li{display:flex;align-items:flex-start;gap:8px;min-width:0}
.fu97 #app .fu97-legend svg{width:22px;height:22px;flex:none;margin-top:1px}
.fu97 #app .fu97-legend span{display:grid;gap:1px;min-width:0}
.fu97 #app .fu97-legend b{color:var(--k-text);font:850 11.5px/1.2 var(--k-font)}
.fu97 #app .fu97-legend small{color:var(--k-muted);font:600 10.5px/1.3 var(--k-font)}
.fu97 #app .fu97-card-story{padding:0;overflow:hidden}
.fu97 #app .fu97-card-story .match-narrative{display:block!important;margin:0!important;padding:12px 14px!important;border:0!important;border-radius:0!important;background:none!important;max-height:none!important}
.fu97 #app .fu97-card-story .match-narrative-head{margin:0 0 8px!important;color:var(--k-soft)!important;font:900 11px/1.2 var(--k-font)!important;letter-spacing:.14em!important}
.fu97 #app .fu97-card-story .match-narrative-list{max-height:210px!important;overflow:auto!important;scrollbar-width:thin;scrollbar-color:#2a3442 transparent;color:#c5cfde!important;font-size:12px!important;line-height:1.45!important}
.fu97 #app .fu97-card-match .controls{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;width:100%!important;margin:0!important;padding:0!important;border:0!important;background:none!important;box-shadow:none!important}
.fu97 #app .fu97-card-match .controls .cpu-auto-tactics{grid-column:1/-1;justify-content:flex-start;min-height:36px;margin:0!important;padding:8px 10px!important;border:1px solid rgba(93,255,168,.22)!important;border-radius:9px!important;background:rgba(93,255,168,.06)!important;color:#bdf5d4!important;font:800 11.5px/1.2 var(--k-font)!important}
.fu97 #app .fu97-card-match .controls button{min-height:42px!important;width:100%!important;margin:0!important;padding:8px 10px!important;border-radius:10px!important;border:1px solid var(--k-line-2)!important;background:var(--k-panel-2)!important;color:var(--k-text)!important;font:850 12px/1.2 var(--k-font)!important;letter-spacing:.03em;box-shadow:none!important;cursor:pointer}
.fu97 #app .fu97-card-match .controls button:hover{border-color:rgba(200,255,46,.5)!important;color:var(--k-lime-2)!important}
.fu97 #app .fu97-card-match .controls #cpuToggleBtn.paused{border-color:rgba(255,176,31,.5)!important;color:#ffe0a6!important}
.fu97 #app .fu97-card-match .controls button:only-of-type{grid-column:1/-1}
.fu97 #app .fu97-card-match .match-duration-control{display:grid!important;grid-template-columns:auto 1fr;align-items:center;gap:4px 10px!important;width:100%!important;max-width:none!important;margin:10px 0 0!important;padding:9px 10px!important;border:1px solid var(--k-line)!important;border-radius:10px!important;background:rgba(255,255,255,.03)!important}
.fu97 #app .fu97-card-match .match-duration-label{color:var(--k-soft)!important;font:850 11px/1.2 var(--k-font)!important;letter-spacing:.08em;text-transform:uppercase}
.fu97 #app .fu97-card-match .match-duration-control select{width:100%!important;max-width:none!important;height:36px!important;padding:0 10px!important;border:1px solid var(--k-line-2)!important;border-radius:8px!important;background:#0a0f16!important;color:var(--k-text)!important;font:750 12px/1 var(--k-font)!important}
.fu97 #app .fu97-card-match .match-duration-control small{grid-column:1/-1;color:var(--k-muted)!important;font:650 10.5px/1.3 var(--k-font)!important}
/* En torneo la duración la fija el campeonato: se mantiene oculta como en la versión anterior. */
html.fu97 body.tournament-match #app .fu97-card-match .match-duration-control{display:none!important}
html.fu97 body.tournament-match #app .fu97-card-match .controls #reset{grid-column:1/-1}
.fu97 #app .fu97-kits{padding:0}
.fu97 #app .fu97-kits>summary{list-style:none;display:flex;align-items:center;gap:8px;margin:0;padding:12px 14px;cursor:pointer;user-select:none}
.fu97 #app .fu97-kits>summary::-webkit-details-marker{display:none}
.fu97 #app .fu97-kits>summary::after{content:"";width:8px;height:8px;margin-left:6px;border-right:2px solid var(--k-muted);border-bottom:2px solid var(--k-muted);transform:rotate(45deg) translateY(-2px);transition:transform .2s}
.fu97 #app .fu97-kits[open]>summary::after{transform:rotate(-135deg) translateY(-2px)}
.fu97 #app .fu97-kits-preview{display:flex;gap:4px;margin-left:auto}
.fu97 #app .fu97-kits-preview svg{width:26px;height:26px}
.fu97 #app .fu97-kits-body{display:grid;gap:10px;padding:0 14px 14px}
.fu97 #app .fu97-kits-body label.ctrl{display:flex!important;align-items:center;justify-content:space-between;gap:8px;width:100%!important;margin:0!important;padding:7px 10px!important;border:1px solid var(--k-line)!important;border-radius:10px!important;background:rgba(255,255,255,.03)!important;color:var(--k-soft)!important;font:800 12px/1.2 var(--k-font)!important}
.fu97 #app .fu97-kits-body label.ctrl input[type=color]{width:32px!important;height:32px!important;flex:0 0 32px!important;padding:0!important;border:1px solid var(--k-line-2)!important;border-radius:8px!important;background:none!important;cursor:pointer}
html.fu97 body.tournament-match #app .fu97-kits-body label.ctrl{display:none!important}
.fu97 #app .fu97-kits-body .fu-practice-kit-studio{display:grid!important;grid-template-columns:1fr!important;gap:10px!important;margin:0!important;padding:0!important;border:0!important;background:none!important;box-shadow:none!important}
.fu97 #app .fu97-kits-body .fu-kit-heading{display:none!important}
.fu97 #app .fu97-kits-body .fu-kit-team{margin:0!important;padding:10px!important;border:1px solid var(--k-line)!important;border-radius:10px!important;background:rgba(255,255,255,.025)!important}
.fu97 #app .fu97-kits-body .alternate-kit-panel{margin:0!important;padding:10px!important;border:1px solid var(--k-line)!important;border-radius:10px!important;background:rgba(255,255,255,.03)!important;color:var(--k-soft)!important;box-shadow:none!important;flex-wrap:wrap;gap:8px!important}
.fu97 #app .fu97-kits-body .alternate-kit-panel strong{color:var(--k-soft)!important;font:900 11px/1.2 var(--k-font)!important;letter-spacing:.1em}
.fu97 #app .fu97-kits-body .alternate-kit-panel button{min-height:38px;padding:6px 12px!important;border:1px solid var(--k-line-2)!important;border-radius:9px!important;background:var(--k-panel-2)!important;color:var(--k-text)!important;font:800 12px/1.2 var(--k-font)!important}
.fu97 #app .fu97-kits-body .alternate-kit-panel #kitStatus{color:var(--k-muted)!important;font-size:11px!important}
.fu97 #app .fu97-foot{display:block!important;margin:0!important;padding:4px 6px!important}
.fu97 #app .fu97-foot .info{margin:0!important;padding:0!important;border:0!important;background:none!important;color:#677386!important;font:600 10.5px/1.5 var(--k-font)!important}
.fu97 #app .tournament-result-panel:not([hidden]){display:flex!important;flex-wrap:wrap;align-items:center;gap:10px 16px;margin:0!important;padding:14px 16px!important;border:1px solid rgba(200,255,46,.4)!important;border-radius:14px!important;background:linear-gradient(135deg,rgba(28,40,8,.95),rgba(10,14,20,.95))!important;color:var(--k-text)!important}
.fu97 #app .tournament-result-panel strong{color:var(--k-lime)!important;font:950 12px/1.2 var(--k-font)!important;letter-spacing:.14em}
.fu97 #app .tournament-result-panel a{margin-left:auto;padding:9px 14px;border-radius:10px;background:var(--k-lime);color:#091200!important;font:950 12px/1 var(--k-font);letter-spacing:.06em;text-decoration:none}

/* ---------------------------------------------------------------- avisos: gol, descanso, final, falta */
.fu97 .goal-celebration-overlay{background:radial-gradient(ellipse at 50% 40%,rgba(10,16,24,.9),rgba(3,5,8,.97))!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;overflow:hidden}
.fu97 .goal-celebration-card{
 position:relative;width:min(460px,100%)!important;padding:26px 26px 22px!important;border:1px solid rgba(255,255,255,.1)!important;border-radius:22px!important;
 background:linear-gradient(160deg,rgba(24,33,46,.98),rgba(9,13,19,.98))!important;box-shadow:0 30px 80px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.06)!important;
 color:var(--k-text)!important;animation:fu97CardIn .55s cubic-bezier(.2,.9,.3,1.2) both;
}
.fu97 .goal-celebration-card::before{content:""!important;position:absolute;inset:0 0 auto 0;height:5px;border-radius:22px 22px 0 0;background:linear-gradient(90deg,var(--k-lime),var(--k-cyan))}
.fu97 #goalCelebrationOverlay[data-team="2"] .goal-celebration-card::before{background:linear-gradient(90deg,var(--k-amber),var(--k-red))}
.fu97 .goal-celebration-kicker{color:var(--k-lime)!important;font:950 11px/1.2 var(--k-font)!important;letter-spacing:.24em!important}
.fu97 #goalCelebrationOverlay[data-team="2"] .goal-celebration-kicker{color:var(--k-amber)!important}
.fu97 .goal-celebration-ball{width:64px;height:64px;margin:12px auto 6px!important;font-size:0!important;line-height:0!important;color:transparent!important;background:center/contain no-repeat;filter:drop-shadow(0 8px 14px rgba(0,0,0,.5))}
.fu97 #goalCelebrationOverlay .goal-celebration-ball{animation-iteration-count:2!important;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-32 -32 64 64'%3E%3Cdefs%3E%3CradialGradient id='g' cx='38%25' cy='30%25' r='75%25'%3E%3Cstop offset='0' stop-color='%23fff'/%3E%3Cstop offset='.62' stop-color='%23eef1ee'/%3E%3Cstop offset='1' stop-color='%23a9b3ae'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle r='29' fill='url(%23g)' stroke='%23182018' stroke-width='1.5'/%3E%3Cpath d='M0-10 9.5-3 6 8H-6l-3.5-11Z' fill='%23151a1d'/%3E%3Cpath d='M0-10V-19M9.5-3l9-3M6 8l5 8M-6 8l-5 8M-9.5-3l-9-3' stroke='%23151a1d' stroke-width='2'/%3E%3Cpath d='M-6-27 0-20 6-27M22-17 18-7 26 0M22 18 14 15 10 25M-22 18-14 15-10 25M-22-17-18-7-26 0' fill='none' stroke='%23151a1d' stroke-width='2.2'/%3E%3C/svg%3E");animation:fu97BallPop 1.4s ease-in-out infinite}
.fu97 #halftimeOverlay .goal-celebration-ball{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='28' fill='none' stroke='%233ee6ff' stroke-width='4'/%3E%3Cpath d='M32 14v18l12 8' fill='none' stroke='%233ee6ff' stroke-width='4.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")}
.fu97 #finalMatchOverlay .goal-celebration-ball{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath d='M18 8h28v10c0 9-6 16-14 17-8-1-14-8-14-17Z' fill='%23ffd25a'/%3E%3Cpath d='M18 12H8c0 9 5 14 11 14M46 12h10c0 9-5 14-11 14' fill='none' stroke='%23ffd25a' stroke-width='4'/%3E%3Cpath d='M28 35h8v9h-8zM20 46h24v8H20z' fill='%23ffb01f'/%3E%3C/svg%3E")}
.fu97 .goal-celebration-title{margin:4px 0 6px!important;font:1000 clamp(34px,6vw,50px)/1 var(--k-font)!important;letter-spacing:-.04em!important;background:linear-gradient(180deg,#fff 30%,#c8ff2e);-webkit-background-clip:text;background-clip:text;color:transparent!important;text-shadow:none!important}
.fu97 #goalCelebrationOverlay[data-team="2"] .goal-celebration-title{background:linear-gradient(180deg,#fff 30%,#ffb01f);-webkit-background-clip:text;background-clip:text}
.fu97 .goal-celebration-team{color:var(--k-soft)!important;font:850 12px/1.3 var(--k-font)!important;letter-spacing:.1em!important}
.fu97 .goal-celebration-score{margin:14px auto 12px!important;padding:10px 20px!important;border:0!important;border-radius:14px!important;background:linear-gradient(180deg,#fbfcfe,#dde3ec)!important;color:#0a0f16!important;font:950 40px/1 var(--k-font)!important;max-width:240px}
.fu97 .goal-celebration-score .goal-score-separator{color:#7d8899!important}
.fu97 .goal-celebration-details,.fu97 .goal-celebration-foot{color:var(--k-muted)!important;font:600 12px/1.55 var(--k-font)!important}
.fu97 .goal-celebration-continue{min-height:48px!important;margin-top:12px!important;padding:0 22px!important;border:0!important;border-radius:12px!important;background:var(--k-lime)!important;color:#091200!important;font:950 13px/1 var(--k-font)!important;letter-spacing:.1em!important;box-shadow:0 10px 26px rgba(200,255,46,.25)!important;cursor:pointer}
.fu97 #goalCelebrationOverlay[data-team="2"] .goal-celebration-continue{background:var(--k-amber)!important;box-shadow:0 10px 26px rgba(255,176,31,.25)!important}
.fu97 .goal-celebration-continue:hover{transform:translateY(-1px);filter:brightness(1.05)}
.fu97 .fu97-confetti{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:0}
.fu97 .fu97-confetti i{position:absolute;top:-16px;width:9px;height:14px;border-radius:2px;opacity:0;animation:fu97Confetti 2.4s cubic-bezier(.25,.6,.4,1) forwards}
.fu97 .goal-celebration-overlay .goal-celebration-card{z-index:1}
.fu97 #app .foul-notice{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;border:1px solid rgba(255,210,90,.45)!important;border-radius:14px!important;background:linear-gradient(135deg,rgba(32,26,8,.96),rgba(10,12,16,.96))!important;box-shadow:0 18px 40px rgba(0,0,0,.5)!important;color:var(--k-text)!important}
.fu97 #app .foul-notice-whistle{width:26px;height:34px;flex:none;font-size:0!important;border-radius:4px;background:linear-gradient(160deg,#ffe066,#f2b705);box-shadow:0 4px 10px rgba(0,0,0,.4);transform:rotate(-10deg)}
.fu97 #app .foul-notice-kicker{color:var(--k-gold)!important;letter-spacing:.18em!important}
.fu97 #app .foul-notice-title{color:#fff!important}
.fu97 #app .foul-notice-detail{color:var(--k-soft)!important}
.fu97 #app .foul-notice-chance{border-radius:999px!important;background:rgba(255,210,90,.15)!important;color:var(--k-gold)!important;border:1px solid rgba(255,210,90,.4)!important}

/* ---------------------------------------------------------------- pantalla completa */
.fu97 #app .board:fullscreen,.fu97 #app .board:-webkit-full-screen{
 display:grid!important;grid-template-columns:minmax(0,1fr)!important;grid-template-rows:auto minmax(0,1fr) auto!important;gap:8px!important;
 width:100vw!important;height:100vh!important;width:100dvw!important;height:100dvh!important;max-width:none!important;margin:0!important;
 padding:max(8px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) max(8px,env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-left))!important;
 border:0!important;border-radius:0!important;background:radial-gradient(ellipse at 50% 0%,#162131,#06080c 70%)!important;overflow:hidden!important;
}
.fu97 #app .board:fullscreen .fullscreen-score-panel,.fu97 #app .board:-webkit-full-screen .fullscreen-score-panel{
 grid-column:1!important;grid-row:1!important;display:block!important;position:static!important;width:100%!important;max-width:none!important;max-height:none!important;
 margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:none!important;box-shadow:none!important;overflow:visible!important;
}
.fu97 #app .board:fullscreen .fullscreen-score-panel::before,.fu97 #app .board:-webkit-full-screen .fullscreen-score-panel::before{content:none!important;display:none!important}
.fu97 #app .fullscreen-score-panel .scoreboard-block{display:flex!important;flex-direction:row!important;width:100%!important;gap:0!important}
.fu97 #app .fullscreen-score-panel .scoreboard-line{display:flex!important;flex-direction:row!important;align-items:stretch!important;gap:8px!important;flex-wrap:nowrap!important}
.fu97 #app .fullscreen-score-panel .fu97-scorebug{display:grid!important;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)!important;justify-items:stretch!important;gap:0!important;width:auto!important}
.fu97 #app .fullscreen-score-panel .fu97-sb-team,.fu97 #app .fullscreen-score-panel .fu97-sb-result{justify-self:stretch!important}
.fu97 #app .fullscreen-score-panel .match-clock{flex-direction:column!important;width:auto!important;padding:6px 14px!important}
.fu97 #app .fullscreen-score-panel .match-clock-time{font-size:22px!important}
.fu97 #app .fullscreen-score-panel .match-clock-state{font-size:9px!important;padding:2px 8px!important}
.fu97 #app .fullscreen-score-panel .fu97-sb-team b{font-size:13px!important}
.fu97 #app .fullscreen-score-panel .score{min-width:38px!important;height:auto!important;font-size:28px!important;padding:0 4px!important}
.fu97 #app .board:fullscreen .fu97-pitchframe,.fu97 #app .board:-webkit-full-screen .fu97-pitchframe{grid-row:2;min-height:0;display:flex;align-items:center;justify-content:center;background:transparent;box-shadow:none;border-radius:0;overflow:visible}
.fu97 #app .board:fullscreen:not(.fu97-vertical):not(.fu97-zoom) .pitch-scroll-area,.fu97 #app .board:-webkit-full-screen:not(.fu97-vertical):not(.fu97-zoom) .pitch-scroll-area{width:100%!important;height:100%!important;max-height:100%!important;display:flex!important;align-items:center;justify-content:center;overflow:hidden!important}
.fu97 #app .board:fullscreen:not(.fu97-vertical):not(.fu97-zoom) .pitch-scroll-area #field,.fu97 #app .board:-webkit-full-screen:not(.fu97-vertical):not(.fu97-zoom) .pitch-scroll-area #field{width:100%!important;height:100%!important;max-height:100%!important;border-radius:12px!important;box-shadow:0 0 0 1px rgba(255,255,255,.08),0 14px 34px rgba(0,0,0,.5)!important}
.fu97 #app .board.fu97-vertical:fullscreen .pitch-scroll-area,.fu97 #app .board.fu97-vertical:-webkit-full-screen .pitch-scroll-area{height:100%!important;width:auto!important;max-width:100%!important;margin:0 auto!important;border-radius:12px!important}
.fu97 #app .board.fu97-zoom:fullscreen .pitch-scroll-area,.fu97 #app .board.fu97-zoom:-webkit-full-screen .pitch-scroll-area{height:100%!important}
.fu97 #app .board:fullscreen .fu97-actionbar,.fu97 #app .board:-webkit-full-screen .fu97-actionbar{grid-row:3}
.fu97 #app .board:fullscreen .goal-celebration-overlay,.fu97 #app .board:-webkit-full-screen .goal-celebration-overlay{position:fixed!important}

/* ---------------------------------------------------------------- tabletas y portátiles chicos */
/* ---------------------------------------------------------------- v97.1 · banderines, canto de fichas, posesión y cartel de jugadas */
.fu97 #field .fu97-tk-hit{fill:transparent;stroke:none}
.fu97 #field .fu97-tk-edge,.fu97 #field .fu97-tk-edge-dk{pointer-events:none}
.fu97 #field .fu97-tk-edge-dk{fill:#000;fill-opacity:.42}
.fu97 #app .fu97-sb-result{position:relative}
.fu97 #app .fu97-sb-result::after{content:"";position:absolute;bottom:0;left:0;width:50%;height:3px;background:var(--k-lime);box-shadow:0 0 8px rgba(200,255,46,.55);opacity:0;transition:left .3s ease,opacity .2s ease;pointer-events:none}
.fu97 #app .fu97-sb-result[data-poss="1"]::after{left:0;opacity:1}
.fu97 #app .fu97-sb-result[data-poss="2"]::after{left:50%;opacity:1}
.fu97 #app .fu97-banner{position:absolute;z-index:6;top:12px;left:50%;display:flex;flex-direction:column;align-items:center;gap:3px;max-width:min(80%,520px);padding:9px 20px 10px;border-radius:12px;background:rgba(6,10,15,.9);border:1px solid rgba(255,255,255,.12);box-shadow:0 12px 30px rgba(0,0,0,.45);opacity:0;visibility:hidden;transform:translate(-50%,-14px);transition:opacity .22s ease,transform .32s cubic-bezier(.2,.9,.3,1.15),visibility 0s linear .32s;pointer-events:none}
.fu97 #app .fu97-banner.is-on{opacity:1;visibility:visible;transform:translate(-50%,0);transition-delay:0s}
.fu97 #app .fu97-banner::before{content:"";position:absolute;left:16px;right:16px;top:-1px;height:3px;border-radius:0 0 3px 3px;background:var(--fu97-banner-c,var(--k-cyan))}
.fu97 #app .fu97-banner b{color:var(--fu97-banner-c,var(--k-cyan));font:950 15px/1.1 var(--k-font);letter-spacing:.12em;white-space:nowrap}
.fu97 #app .fu97-banner span{max-width:100%;overflow:hidden;color:var(--k-soft);font:650 11.5px/1.3 var(--k-font);text-align:center;text-overflow:ellipsis;white-space:nowrap}
.fu97 #app .fu97-banner em{font-style:normal}
.fu97 #app .fu97-banner[data-kind="event"]{--fu97-banner-c:var(--k-amber)}
.fu97 #app .fu97-banner[data-kind="period"]{--fu97-banner-c:var(--k-lime)}
@media (max-width:680px){
 /* En el celular, una sola línea pegada al borde: así no tapa al arquero rival en la cancha vertical. */
 .fu97 #app .fu97-banner{top:4px;max-width:92%;flex-direction:row;align-items:baseline;gap:7px;padding:4px 11px 5px;border-radius:9px}
 .fu97 #app .fu97-banner b{font-size:12px}
 .fu97 #app .fu97-banner span{font-size:10.5px}
 .fu97 #app .fu97-banner span::before{content:"·";margin-right:7px;opacity:.55}
 .fu97 #app .fu97-banner .fu97-banner-more{display:none}
}
@media (prefers-reduced-motion:reduce){
 .fu97 #app .fu97-banner{transform:translate(-50%,0);transition:opacity .2s ease,visibility 0s linear .2s}
 .fu97 #app .fu97-sb-result::after{transition:none}
}
/* ---------------------------------------------------------------- v97.1 · refinamiento: cancha original, indicadores discretos, HUD limpio */
/* Márgenes del SVG que la foto no cubre: tono oscuro de estadio, como en v96. */
.fu97 #app .fu97-pitchframe{background:#0e1a13}
/* Grilla de casillas apenas visible sobre la foto; movimiento: solo el punto; la selección la marca el anillo de la ficha. */
.fu97 #field .cell{stroke:rgba(255,255,255,.06)!important}
.fu97 #field .cell.pl{stroke:none!important}
.fu97 #field .cell.pl.duel{stroke:rgba(255,154,60,.7)!important;stroke-width:2!important}
.fu97 #field .cell.sel{fill:transparent!important;stroke:none!important}
/* Precisión por distancia: tinte suave, sin bordes punteados. */
.fu97 #field .fu97-zone.is-p5{fill-opacity:.07}
.fu97 #field .fu97-zone.is-p4{fill-opacity:.055}
.fu97 #field .fu97-zone.is-p3{fill-opacity:.045}
.fu97 #field .fu97-zone.is-p2,.fu97 #field .fu97-zone.is-p1{fill-opacity:.04}
.fu97 #field .fu97-rcv circle{stroke-width:3.5}
.fu97 #field .fu97-rcv-pill{opacity:.92}
/* Huellas de la CPU más finas (además se desvanecen solas). */
.fu97 #field .fu97-ghost{stroke-width:3;stroke-opacity:.45}
.fu97 #field .fu97-ghost.is-persist{stroke-opacity:.5}
/* HUD: sin degradés de color ni brillos de neón. */
.fu97 #app .fu97-home,.fu97 #app .fu97-away{background:none}
.fu97 #app .match-clock{border-color:var(--k-line)!important;box-shadow:none!important}
.fu97 #app .match-clock-time{color:#f4f7fb!important;text-shadow:none!important}
.fu97 #app .match-clock-state{border-color:var(--k-line)!important;background:transparent!important;color:var(--k-muted)!important}
.fu97 #app .fu97-turnbox .fu97-turn-badge{box-shadow:none}
.fu97 #app .fu97-pips i.is-now{box-shadow:none}
.fu97 #app .fu97-sb-result::after{box-shadow:none}
.fu97 #app .fu97-actionbar #ballModeControl:not(:disabled):not(.active){box-shadow:0 6px 16px rgba(0,0,0,.3)!important}
.fu97 #app .fu97-actionbar #ballModeControl.active{box-shadow:none!important}
/* Guía de lectura plegable: queda cerrada y se abre desde su título. */
.fu97 #app .fu97-card-legend .fu97-card-title{cursor:pointer;margin-bottom:0;user-select:none}
.fu97 #app .fu97-card-legend .fu97-card-title::after{content:"";width:7px;height:7px;margin:0 3px 3px auto;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg);transition:transform .2s ease}
.fu97 #app .fu97-card-legend.is-collapsed .fu97-card-title::after{transform:rotate(-45deg);margin-bottom:0}
.fu97 #app .fu97-card-legend:not(.is-collapsed) .fu97-card-title{margin-bottom:10px}
.fu97 #app .fu97-card-legend.is-collapsed .fu97-legend{display:none}
.fu97 #app .fu97-card-legend .fu97-card-title:focus-visible{outline:2px solid var(--k-lime);outline-offset:3px;border-radius:4px}
@media (max-width:1599.98px){
 .fu97 #app .fu97-nav-label{display:none}
 .fu97 #app .fu97-nav a{padding:0 15px!important}
}
@media (max-width:1280px){
 .fu97 #app .fu97-turnbox{min-width:170px}
}
@media (max-width:1000px){
 .fu97 #app .fu97-actionbar{grid-template-columns:minmax(170px,auto) minmax(0,1fr) auto}
 .fu97 #app .scoreboard-line{flex-wrap:wrap!important;gap:6px!important}
 .fu97 #app .fu97-scorebug{flex:1 1 100%}
 .fu97 #app .match-clock{flex:1 1 0;flex-direction:row!important;gap:10px!important}
 .fu97 #app .fu97-turnbox{flex:1 1 0;grid-template-columns:auto auto 1fr;grid-template-rows:auto;align-items:center}
 .fu97 #app .fu97-turn-badge{grid-column:auto}
 .fu97 #app .fu97-nav{align-self:flex-start}
 .fu97 #app .fu97-nav a{min-height:52px}
}

/* ---------------------------------------------------------------- celular vertical */
@media (max-width:680px){
 html.fu97 body{padding:6px 6px calc(12px + env(safe-area-inset-bottom))!important}
 .fu97 #app .head.fu97-topbar{gap:6px!important;margin:0 0 6px!important;padding:5px!important;border-radius:13px!important}
 .fu97 #app .fu97-nav{display:none!important}
 .fu97 #app .scoreboard-line{flex-wrap:wrap!important;gap:5px!important}
 .fu97 #app .fu97-scorebug{flex:1 1 100%;min-height:44px;border-radius:10px}
 .fu97 #app .fu97-sb-team{gap:6px;padding:0 9px}
 .fu97 #app .fu97-sb-team b{font-size:11px!important;letter-spacing:.03em!important}
 .fu97 #app .fu97-sb-team .tournament-crest-inline{width:22px!important;height:22px!important}
 .fu97 #app .fu97-kitchip{width:26px;height:26px}
 html.fu97 body.tournament-match #app .fu97-kitchip{display:none}
 html.fu97 body.tournament-match #app .fu97-name-full{display:none}
 html.fu97 body.tournament-match #app .fu97-name-short{display:inline}
 .fu97 #app .fu97-sb-result .score{min-width:30px!important;font-size:25px!important}
 .fu97 #app .fu97-sb-sep{font-size:16px}
 .fu97 #app .match-clock{flex:1 1 0;min-width:0;flex-direction:row!important;gap:8px!important;padding:5px 10px!important;border-radius:10px!important}
 .fu97 #app .match-clock-time{font-size:19px!important}
 .fu97 #app .match-clock-state{display:none!important}
 .fu97 #app .match-clock.fu97-clock-break .match-clock-state,.fu97 #app .match-clock.fu97-clock-final .match-clock-state{display:block!important;max-width:110px;font-size:8.5px!important}
 .fu97 #app .fu97-turnbox{flex:1 1 0;min-width:0;grid-template-columns:auto auto;grid-template-rows:auto;justify-content:space-between;align-items:center;padding:5px 9px;border-radius:10px}
 .fu97 #app .fu97-turn-badge{grid-column:auto;font-size:10.5px;padding:4px 8px 3px}
 .fu97 #app .fu97-turn-sub{display:none}
 .fu97 #app .fu97-pips i{width:13px;height:5px}
 .fu97 #app .board{padding:4px!important;gap:5px;border-radius:14px!important}
 .fu97 #app .fu97-pitchframe{border-radius:10px}
 .fu97 #app .fu97-actionbar{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"player fab" "msg msg";gap:6px;padding:5px;border-radius:11px}
 .fu97 #app .board.fu97-vertical .fu97-actionbar{position:sticky;bottom:calc(4px + env(safe-area-inset-bottom));z-index:8;background:rgba(7,11,16,.97);box-shadow:0 -12px 28px rgba(0,0,0,.55)}
 .fu97 #app .fu97-ab-player{grid-area:player;padding:3px 8px 3px 3px;gap:7px}
 .fu97 #app .fu97-ab-token{width:32px;height:32px}
 .fu97 #app .fu97-ab-text strong{font-size:12px}
 .fu97 #app .fu97-ab-text small{font-size:10px}
 .fu97 #app .fu97-ab-tools{gap:5px}
 .fu97 #app .fu97-ab-tools .fu97-tool{min-width:38px!important;min-height:34px!important;padding:0 8px!important;border-radius:10px!important}
 .fu97 #app .fu97-tool svg{width:18px;height:18px}
 .fu97 #app .fu97-tool span:not(.fs-icon){display:none}
 .fu97 #app .fu97-actionbar #ballModeControl{grid-area:fab;min-width:0;height:44px!important;min-height:44px!important;padding:0 12px 0 5px!important;gap:6px}
 .fu97 #app .fu97-actionbar .ball-fab-icon{width:30px!important;height:30px!important}
 .fu97 #app .fu97-actionbar .ball-fab-label{font-size:11px!important;letter-spacing:.06em!important}
 .fu97 #app .fu97-ab-msg{grid-area:msg;min-height:0;padding:6px 9px}
 .fu97 #app .fu97-ab-msg #msg{font-size:12px!important}
 .fu97 #app .fu97-legend{grid-template-columns:1fr 1fr}
 .fu97 #app .fullscreen-score-panel .scoreboard-line{flex-wrap:wrap!important;gap:5px!important}
 .fu97 #app .fullscreen-score-panel .fu97-scorebug{flex:1 1 100%!important}
 .fu97 #app .fullscreen-score-panel .match-clock{flex-direction:row!important;padding:5px 10px!important}
 .fu97 #app .fullscreen-score-panel .match-clock-time{font-size:19px!important}
 .fu97 #app .fullscreen-score-panel .score{font-size:25px!important;min-width:30px!important}
 .fu97 #app .fullscreen-score-panel .fu97-sb-team b{font-size:11px!important}
}
/* Celulares bajos: el relato ocupa una línea (con «Ver más») para que la cancha entre completa. */
@media (max-width:680px) and (max-height:760px){
 .fu97 #app .fu97-ab-msg{padding:4px 8px}
 .fu97 #app .fu97-ab-msg #msg{-webkit-line-clamp:1}
}
@media (max-width:380px){
 .fu97 #app .fu97-nav{display:none!important}
 .fu97 #app .fu97-sb-team b{font-size:10px!important}
 .fu97 #app .fu97-kitchip{width:22px;height:22px}
 .fu97 #app .fu97-actionbar .ball-fab-label{display:none!important}
}
/* v97.1.2 · Celular vertical: en la vista completa (y en pantalla completa) no se muestra el relato inferior
   y la barra de acción queda en una sola fila, sin hueco vacío. En escritorio el relato sigue visible. */
@media (max-width:680px) and (orientation:portrait){
 .fu97 #app.fu97-mobile-complete .fu97-card-story,.fu97 #app.fu97-mobile-complete .fu97-ab-msg{display:none!important}
 .fu97 #app.fu97-mobile-complete .fu97-actionbar{grid-template-columns:minmax(0,1fr) auto!important;grid-template-areas:"player fab"!important}
 .fu97 #app .board:fullscreen .fu97-ab-msg,.fu97 #app .board:-webkit-full-screen .fu97-ab-msg{display:none!important}
 .fu97 #app .board:fullscreen .fu97-actionbar,.fu97 #app .board:-webkit-full-screen .fu97-actionbar{grid-template-columns:minmax(0,1fr) auto!important;grid-template-areas:"player fab"!important}
}

/* ---------------------------------------------------------------- celular horizontal (poca altura) */
@media (orientation:landscape) and (max-height:560px){
 html.fu97 body{padding:6px 8px!important}
 .fu97 #app.fu97-app{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(250px,31vw);grid-template-rows:auto minmax(0,1fr);column-gap:8px;row-gap:6px;--fu97-head-side:1}
 .fu97 #app .head.fu97-topbar{grid-column:2;grid-row:1;margin:0!important;padding:5px!important;flex-direction:column!important;gap:5px!important}
 .fu97 #app .fu97-nav{display:none!important}
 .fu97 #app .scoreboard-line{flex-wrap:wrap!important;gap:5px!important}
 .fu97 #app .fu97-scorebug{flex:1 1 100%;min-height:40px}
 .fu97 #app .fu97-sb-team{padding:0 8px;gap:6px}
 .fu97 #app .fu97-sb-team b{font-size:10px!important}
 .fu97 #app .fu97-kitchip{width:22px;height:22px}
 .fu97 #app .fu97-name-full{display:none}
 .fu97 #app .fu97-name-short{display:inline}
 .fu97 #app .fu97-sb-result .score{min-width:26px!important;font-size:22px!important}
 .fu97 #app .match-clock{flex:1 1 0;min-width:0;flex-direction:row!important;gap:6px!important;padding:4px 8px!important}
 .fu97 #app .match-clock-time{font-size:16px!important}
 .fu97 #app .match-clock-state{display:none!important}
 .fu97 #app .fu97-turnbox{flex:1 1 0;min-width:0;grid-template-columns:auto auto;padding:4px 8px}
 .fu97 #app .fu97-turn-badge{grid-column:auto;font-size:10px;padding:3px 7px}
 .fu97 #app .fu97-turn-sub{display:none}
 .fu97 #app .fu97-pips i{width:11px;height:5px}
 .fu97 #app .fu97-main{display:contents}
 .fu97 #app .fu97-pitchcol{grid-column:1;grid-row:1/span 2}
 .fu97 #app .fu97-side{grid-column:2;grid-row:2;display:flex;flex-direction:column;max-height:calc(100dvh - 120px);overflow:auto;position:static}
 .fu97 #app .board{padding:4px!important;gap:5px;border-radius:12px!important}
 .fu97 #app .fu97-actionbar{grid-template-columns:auto minmax(0,1fr) auto;gap:6px;padding:4px}
 .fu97 #app .fu97-ab-player{padding:3px;background:none;border:0}
 .fu97 #app .fu97-ab-token{width:30px;height:30px}
 .fu97 #app .fu97-ab-text{display:none}
 .fu97 #app .fu97-msg-more{padding:2px 7px;font-size:9.5px}
 .fu97 #app .fu97-ab-msg{min-height:36px;padding:3px 8px}
 .fu97 #app .fu97-ab-msg #msg{font-size:11px!important;-webkit-line-clamp:2}
 .fu97 #app .fu97-ab-tools .fu97-tool{min-height:30px!important;min-width:34px!important;padding:0 7px!important}
 .fu97 #app .fu97-tool span:not(.fs-icon){display:none}
 .fu97 #app .fu97-actionbar #ballModeControl{height:40px!important;min-height:40px!important;min-width:0;padding:0 10px 0 4px!important}
 .fu97 #app .fu97-actionbar .ball-fab-icon{width:28px!important;height:28px!important}
 .fu97 #app .fu97-actionbar .ball-fab-label{font-size:10px!important}
}

/* ---------------------------------------------------------------- animaciones */
@keyframes fu97BoardIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes fu97ScoreBump{0%{transform:scale(1)}25%{transform:scale(1.45);color:#3a8a00}100%{transform:scale(1)}}
@keyframes fu97MsgFlash{0%{background:rgba(62,230,255,.16)}100%{background:rgba(255,255,255,.025)}}
@keyframes fu97CardIn{0%{opacity:0;transform:translateY(16px) scale(.94)}100%{opacity:1;transform:none}}
@keyframes fu97BallPop{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-8px) rotate(20deg)}}
@keyframes fu97Confetti{0%{opacity:1;transform:translate(0,0) rotate(0)}100%{opacity:.9;transform:translate(var(--fu97-drift,0),110vh) rotate(var(--fu97-rot,360deg))}}
@media (prefers-reduced-motion:reduce){
 .fu97 #app .board,.fu97 .goal-celebration-card,.fu97 #goalCelebrationOverlay .goal-celebration-ball,.fu97 #app .fu97-ab-msg.is-flash,.fu97 #app .fu97-sb-result .score.fu97-bump{animation:none!important}
 .fu97 .fu97-confetti{display:none!important}
}
`;
const V97_MATCH_PATCH = String.raw`
// ==================== FÚTBOL ÚNICO v97 · REDISEÑO VISUAL DEL PARTIDO ====================
// Capa exclusivamente visual. Se instala después de v96, dentro del mismo alcance del motor.
// No modifica reglas, probabilidades, resolución de acciones, cronómetro ni IA:
//  · las funciones de dibujo y animación reemplazadas conservan duraciones, posiciones finales,
//    textos de estado y promesas (el motor espera exactamente lo mismo que antes);
//  · los efectos usan un generador pseudoaleatorio propio y nunca consumen Math.random;
//  · los paneles existentes se reubican moviendo los mismos nodos (ids y manejadores intactos);
//  · nada se dibuja mientras la CPU explora jugadas simuladas (estado transitorio).
(function fu97VisualLayer(){
 'use strict';
 const VERSION='97.0.0';
 const SVGNS='http://www.w3.org/2000/svg';
 const rootEl=document.documentElement;
 const appEl=$('app');
 const boardEl=document.querySelector('#app .board');
 const fieldEl=$('field');
 const scrollEl=$('pitchScrollArea');
 const textureEl=$('pitchTexture');
 const defsEl=fieldEl?fieldEl.querySelector('defs'):null;
 if(!appEl||!boardEl||!fieldEl||!scrollEl||!defsEl||!playersG||!ballG||!cells||!targetsG||!rangeG||!grass||!gL||!gR){
  console.warn('[Fútbol Único v97] No se reconoció la estructura del partido; se conserva la vista anterior.');
  return;
 }
 const mq=q=>window.matchMedia?window.matchMedia(q):{matches:false,addEventListener(){}};
 const motionMQ=mq('(prefers-reduced-motion: reduce)');
 const portraitMQ=mq('(max-width: 680px) and (orientation: portrait)');
 const reducedMotion=()=>!!motionMQ.matches;
 const ACTIONS=typeof ACTIONS_PER_TURN==='number'?ACTIONS_PER_TURN:3;
 // El motor explora variantes de forma asíncrona modificando temporalmente p/ball/turn.
 const stateIsLive=()=>!cpuSearching&&simulationRandomState===null&&!brainTrainingRunning&&!sequenceSearchRunning;
 // La foto original cubre y=-31…1094,5. El viewBox conserva su tamaño (mismo diseño de pantalla) y se corre
 // para que los márgenes sin foto queden chicos y parejos arriba y abajo.
 const VB={x:-95,y:-45,w:1990,h:1160};
 let vertical=false;
 // En la cancha vertical el SVG gira -90°; fichas, balón y etiquetas giran +90° para quedar derechas.
 // El balón se agranda en la cancha vertical del celular para que se distinga bien.
 const upT=(big,ball)=>vertical?(ball?'rotate(90) scale(1.38)':big?'rotate(90) scale(1.1)':'rotate(90)'):null;
 function upGroup(parent,big,cls){const g=svg('g',{class:'fu97-up'+(cls?' '+cls:''),transform:upT(big)},parent);if(big)g.dataset.big='1';return g;}
 function refreshUprights(){fieldEl.querySelectorAll('.fu97-up').forEach(n=>{const t=upT(n.dataset.big==='1',n.dataset.ball==='1');if(t)n.setAttribute('transform',t);else n.removeAttribute('transform');});}
 const TK={rim:34,body:30.5,sel:43,halo:50};

 // ---------------------------------------------------------------- utilidades
 function svg(tag,attrs,parent){
  const n=document.createElementNS(SVGNS,tag);
  if(attrs)for(const k in attrs){const v=attrs[k];if(v!==null&&v!==undefined)n.setAttribute(k,String(v));}
  if(parent)parent.appendChild(n);
  return n;
 }
 function el(tag,cls,parent,text){
  const n=document.createElement(tag);
  if(cls)n.className=cls;
  if(text!==undefined&&text!==null)n.textContent=text;
  if(parent)parent.appendChild(n);
  return n;
 }
 const r1=v=>Math.round(v*10)/10;
 const owned=q=>!!q&&q.owner!==null&&q.owner!==undefined;
 const cheb=(a,b)=>Math.max(Math.abs(a.c-b.c),Math.abs(a.r-b.r));
 let fxSeed=0x2F6B1D3;
 function fxRandom(){
  fxSeed=(fxSeed+0x6D2B79F5)|0;
  let t=Math.imul(fxSeed^(fxSeed>>>15),1|fxSeed);
  t=(t+Math.imul(t^(t>>>7),61|t))^t;
  return ((t^(t>>>14))>>>0)/4294967296;
 }
 const ease={
  inOutCubic:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,
  outCubic:t=>1-Math.pow(1-t,3),
  outQuart:t=>1-Math.pow(1-t,4),
  inOutSine:t=>-(Math.cos(Math.PI*t)-1)/2
 };
 function hexToRgb(hex){
  let v=String(hex||'').trim().replace('#','');
  if(v.length===3)v=v.split('').map(ch=>ch+ch).join('');
  const n=parseInt(v.slice(0,6),16);
  return Number.isFinite(n)?{r:(n>>16)&255,g:(n>>8)&255,b:n&255}:{r:128,g:128,b:128};
 }
 function luminance(hex){
  const c=hexToRgb(hex);
  const ch=[c.r,c.g,c.b].map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);});
  return .2126*ch[0]+.7152*ch[1]+.0722*ch[2];
 }
 function rgba(hex,a){const c=hexToRgb(hex);return 'rgba('+c.r+','+c.g+','+c.b+','+a+')';}
 const numberStroke=hex=>luminance(hex)>.42?'rgba(5,9,14,.82)':'rgba(255,255,255,.7)';
 function kit(t){
  return {
   primary:colors[t]||'#777777',
   secondary:kitColors[t]||'#ffffff',
   accent:accentColors[t]||'#ffffff',
   number:numberColors[t]||accentColors[t]||'#ffffff',
   pattern:kitPatterns[t]||'plain'
  };
 }
 function teamName(t){
  try{return typeof tournamentTeamName==='function'?tournamentTeamName(t):'Equipo '+t;}catch(e){return 'Equipo '+t;}
 }
 const escapeText=s=>String(s==null?'':s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

 // Diseños de camiseta: mismas figuras del motor (definidas para radio 22) escaladas al radio pedido.
 function kitShapes(pattern,R){
  const k=R/22,s=[];
  const rect=(x,y,w,h)=>s.push(['rect',{x:r1(x*k),y:r1(y*k),width:r1(w*k),height:r1(h*k)}]);
  const poly=pts=>s.push(['polygon',{points:pts.map((v,i)=>r1(v*k)+(i%2?' ':',')).join('').trim()}]);
  if(pattern==='stripes'){for(let xx=-24;xx<=24;xx+=10)rect(xx,-24,5,48);}
  else if(pattern==='pinstripes'){for(let xx=-24;xx<=24;xx+=7)rect(xx,-24,2,48);}
  else if(pattern==='wide-stripes'){for(let xx=-24;xx<=24;xx+=15)rect(xx,-24,8,48);}
  else if(pattern==='double-stripe'){rect(2,-24,4,48);rect(9,-24,4,48);}
  else if(pattern==='central'){rect(-6,-24,12,48);}
  else if(pattern==='band'){rect(-24,-5,48,10);}
  else if(pattern==='chestband'){rect(-24,-7,48,14);}
  else if(pattern==='sash'){poly([-26,-13,-19,-24,27,12,20,24]);}
  else if(pattern==='half'){rect(-22,-22,22,44);}
  else if(pattern==='badge'){s.push(['circle',{cx:0,cy:r1(k),r:r1(8*k)}]);}
  else if(pattern==='shoulders'){rect(-24,-23,48,11);}
  else if(pattern==='sleeves'){poly([-23,-22,-10,-22,-14,22,-23,22]);poly([10,-22,23,-22,23,22,14,22]);}
  else if(pattern==='hoops'){for(let yy=-22;yy<=22;yy+=13)rect(-24,yy,48,6);}
  else if(pattern==='v'){poly([-24,-23,-13,-23,0,-4,13,-23,24,-23,24,-13,0,9,-24,-13]);}
  return s;
 }
 function shapesMarkup(shapes){
  return shapes.map(sh=>'<'+sh[0]+' '+Object.keys(sh[1]).map(k=>k+'="'+sh[1][k]+'"').join(' ')+'/>').join('');
 }
 const SHIRT='M13 5 4.5 9.6 1.4 18.3 8 20.6 10 16.8 10 36.2H30V16.8L32 20.6 38.6 18.3 35.5 9.6 27 5C25 8.5 22.7 10 20 10S15 8.5 13 5Z';
 function shirtSvg(t,id){
  const k=kit(t),pattern=k.pattern==='plain'?'':shapesMarkup(kitShapes(k.pattern,22));
  return '<svg class="fu97-shirt" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><defs><clipPath id="'+id+'"><path d="'+SHIRT+'"/></clipPath>'+
   '<linearGradient id="'+id+'s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient></defs>'+
   '<path d="'+SHIRT+'" fill="'+escapeText(k.primary)+'"/>'+
   (pattern?'<g clip-path="url(#'+id+')"><g transform="translate(20 21) scale(.8)" fill="'+escapeText(k.secondary)+'">'+pattern+'</g></g>':'')+
   '<path d="'+SHIRT+'" fill="url(#'+id+'s)" opacity=".9"/>'+
   '<path d="M13 5C15 8.5 17.3 10 20 10S25 8.5 27 5" fill="none" stroke="'+escapeText(k.accent)+'" stroke-width="1.8"/>'+
   '<path d="'+SHIRT+'" fill="none" stroke="rgba(0,0,0,.5)" stroke-width="1.1" stroke-linejoin="round"/></svg>';
 }
 function miniTokenSvg(x,id){
  const k=kit(x.t),gk=x.n===1,base=gk?dark(k.primary):k.primary;
  const pattern=!gk&&k.pattern!=='plain'?'<g clip-path="url(#'+id+')" fill="'+escapeText(k.secondary)+'">'+shapesMarkup(kitShapes(k.pattern,TK.body))+'</g>':'';
  return '<svg viewBox="-36 -36 72 72" aria-hidden="true" focusable="false"><defs><clipPath id="'+id+'"><circle r="'+TK.body+'"/></clipPath></defs>'+
   '<circle r="'+TK.rim+'" fill="'+escapeText(k.accent)+'" stroke="rgba(0,0,0,.4)" stroke-width="1.5"/>'+
   '<circle r="'+TK.body+'" fill="'+escapeText(base)+'"/>'+pattern+
   '<circle r="'+TK.body+'" fill="url(#fu97TkShadeHtml)"/>'+
   '<text y="10.6" text-anchor="middle" class="fu97-mini-num" fill="'+escapeText(k.number)+'" stroke="'+numberStroke(k.number)+'">'+x.n+'</text></svg>';
 }

 // ---------------------------------------------------------------- definiciones SVG compartidas
 function installDefs(){
  const d=defsEl;
  const stops=(g,list)=>list.forEach(s=>svg('stop',{offset:s[0],'stop-color':s[1],'stop-opacity':s[2]},g));
  const radial=(id,attrs,list)=>{const g=svg('radialGradient',Object.assign({id},attrs),d);stops(g,list);return g;};
  const linear=(id,attrs,list)=>{const g=svg('linearGradient',Object.assign({id},attrs),d);stops(g,list);return g;};
  svg('circle',{r:TK.body},svg('clipPath',{id:'fu97TkClip',clipPathUnits:'userSpaceOnUse'},d));
  svg('circle',{r:12.4},svg('clipPath',{id:'fu97BallClip',clipPathUnits:'userSpaceOnUse'},d));
  svg('rect',{x:0,y:0,width:1800,height:1100},svg('clipPath',{id:'fu97FieldClip',clipPathUnits:'userSpaceOnUse'},d));
  radial('fu97TkShade',{cx:'34%',cy:'27%',r:'78%'},[[0,'#ffffff',.34],[.38,'#ffffff',.04],[.72,'#000000',.1],[1,'#000000',.46]]);
  linear('fu97TkGloss',{x1:0,y1:0,x2:0,y2:1},[[0,'#ffffff',.6],[1,'#ffffff',0]]);
  radial('fu97GroundShadow',{},[[0,'#000000',.58],[.5,'#000000',.32],[1,'#000000',0]]);
  radial('fu97BallBase',{cx:'36%',cy:'30%',r:'75%'},[[0,'#ffffff',1],[.6,'#f2f4f1',1],[1,'#b9c2bd',1]]);
  radial('fu97BallShade',{cx:'32%',cy:'26%',r:'80%'},[[0,'#ffffff',.25],[.55,'#000000',0],[1,'#000000',.42]]);
  radial('fu97Spark',{},[[0,'#ffffff',1],[.35,'#fff6c4',.85],[1,'#ffb01f',0]]);
  radial('fu97Glow',{},[[0,'#ffffff',.9],[.45,'#ffffff',.3],[1,'#ffffff',0]]);
  const dot=svg('pattern',{id:'fu97MoveDot',patternUnits:'userSpaceOnUse',width:100,height:100},d);
  svg('rect',{width:100,height:100,fill:'#c8ff2e','fill-opacity':.075},dot);
  svg('circle',{cx:50,cy:50,r:19,fill:'none',stroke:'#c8ff2e','stroke-opacity':.42,'stroke-width':3},dot);
  svg('circle',{cx:50,cy:50,r:8.5,fill:'#eaffb5','fill-opacity':.95},dot);
  const duel=svg('pattern',{id:'fu97DuelMark',patternUnits:'userSpaceOnUse',width:100,height:100},d);
  svg('rect',{width:100,height:100,fill:'#ff8a1f','fill-opacity':.2},duel);
  svg('path',{d:'M36 36 64 64M64 36 36 64',stroke:'#ffd0a0','stroke-width':7,'stroke-linecap':'round'},duel);
  const net=svg('pattern',{id:'fu97Net',patternUnits:'userSpaceOnUse',width:13,height:13},d);
  svg('path',{d:'M0 0 13 13M13 0 0 13',stroke:'#ffffff','stroke-opacity':.36,'stroke-width':1.4},net);
  const marker=(id,color)=>{
   const m=svg('marker',{id,viewBox:'0 0 10 10',refX:5.5,refY:5,markerWidth:4.2,markerHeight:4.2,orient:'auto-start-reverse',markerUnits:'strokeWidth'},d);
   svg('path',{d:'M0 0 10 5 0 10 2.6 5Z',fill:color},m);
  };
  marker('fu97ArrowLime','#d8ff6a');marker('fu97ArrowAmber','#ffc04a');marker('fu97ArrowRed','#ff6b78');
  marker('fu97ArrowCyan','#6ff0ff');marker('fu97ArrowWhite','#ffffff');marker('fu97ArrowOrange','#ff9a3c');
  // Gradiente de sombreado reutilizado por las miniaturas HTML (mismo documento).
  if(!$('fu97HtmlDefs')){
   const holder=document.createElementNS(SVGNS,'svg');holder.id='fu97HtmlDefs';holder.setAttribute('aria-hidden','true');
   holder.setAttribute('width','0');holder.setAttribute('height','0');holder.style.position='absolute';
   const hd=svg('defs',null,holder);
   const g=svg('radialGradient',{id:'fu97TkShadeHtml',cx:'34%',cy:'27%',r:'78%'},hd);
   stops(g,[[0,'#ffffff',.34],[.38,'#ffffff',.04],[.72,'#000000',.1],[1,'#000000',.46]]);
   document.body.appendChild(holder);
  }
 }

 // ---------------------------------------------------------------- césped y líneas
 // Textura generada una sola vez: franjas de corte alineadas a las casillas, grano, desgaste y viñeta.
 // Arcos de la foto original, medidos sobre la textura: boca sobre la línea de meta de la foto y red hacia afuera.
 // No se dibujan arcos vectoriales encima (se verían dobles); esta geometría solo sirve para que el balón
 // termine dentro de la red fotografiada en los goles.
 const goalParts={
  L:{gx:27,dir:-1,back:-25,top:478,bot:612},
  R:{gx:1772,dir:1,back:1825,top:478,bot:612}
 };
 function buildPitch(){
  // v97.1: la cancha es la foto original del motor (césped, líneas, áreas y arcos fotografiados) con su filtro de
  // color original. No se reemplaza por una textura generada ni se le dibujan líneas encima: las líneas vectoriales
  // de v97 no coinciden con las de la foto (hasta 80 unidades de diferencia) y se verían dobles.
  fieldEl.setAttribute('viewBox',VB.x+' '+VB.y+' '+VB.w+' '+VB.h);
  // Zonas clicables del arco: la parte de la red fotografiada que queda fuera de la cancha. No tapan las tres
  // casillas de remate (columnas 0 y 17), que siguen recibiendo su clic.
  gL.setAttribute('x','-40');gL.setAttribute('y','478');gL.setAttribute('width','40');gL.setAttribute('height','134');
  gR.setAttribute('x','1800');gR.setAttribute('y','478');gR.setAttribute('width','40');gR.setAttribute('height','134');
 }

 // ---------------------------------------------------------------- capas de efectos
 let fxLow=null,fxHigh=null,previewG=null,ghostG=null;
 function buildLayers(){
  ['players','ball'].forEach(id=>{const n=$(id);if(n)n.removeAttribute('filter');});
  ghostG=svg('g',{id:'fu97Ghosts','pointer-events':'none'});
  previewG=svg('g',{id:'fu97Preview','pointer-events':'none'});
  fxLow=svg('g',{id:'fu97FxLow','pointer-events':'none'});
  fxHigh=svg('g',{id:'fu97FxHigh','pointer-events':'none'});
  fieldEl.insertBefore(ghostG,gL);
  fieldEl.insertBefore(previewG,gL);
  fieldEl.insertBefore(fxLow,playersG);
  fieldEl.insertBefore(fxHigh,ballG);
 }
 function fxLater(node,ms){setTimeout(()=>{if(node&&node.parentNode)node.parentNode.removeChild(node);},ms);}
 // Desvanecido por atributo (sin transiciones CSS sobre hijos del SVG).
 function fadeLater(node,ms){setTimeout(()=>{if(!node||!node.parentNode)return;rafAnimate(500,t=>{if(node.parentNode)node.setAttribute('opacity',(1-t).toFixed(3));}).then(()=>{if(node.parentNode)node.parentNode.removeChild(node);});},ms);}
 function dustPuff(x,y,color){
  if(reducedMotion()||!fxLow)return;
  const g=svg('g',{class:'fu97-dust',transform:'translate('+r1(x)+' '+r1(y)+')'},fxLow);
  const parts=[];
  for(let i=0;i<5;i++){
   const a=Math.PI*(.15+.7*fxRandom())+(i%2?Math.PI:0),d=10+fxRandom()*14,r0=4+fxRandom()*4;
   parts.push({c:svg('circle',{cx:r1(Math.cos(a)*d),cy:r1(Math.sin(a)*d*.45),r:r0,fill:color||'#e8f2d8'},g),r0,dx:Math.cos(a)*10,dy:Math.sin(a)*4});
  }
  fxAnimate(g,640,t=>{const e=ease.outCubic(t);parts.forEach(q=>{q.c.setAttribute('r',r1(q.r0*(1+1.3*e)));q.c.setAttribute('fill-opacity',(.5*(1-t)).toFixed(3));q.c.setAttribute('transform','translate('+r1(q.dx*e)+' '+r1(q.dy*e)+')');});});
 }
 function sparkBurst(x,y,color){
  if(!fxHigh)return;
  const g=svg('g',{class:'fu97-spark',transform:'translate('+r1(x)+' '+r1(y)+')'},fxHigh);
  const core=svg('circle',{r:10,fill:'url(#fu97Spark)'},g);
  const lines=[];
  if(!reducedMotion()){
   for(let i=0;i<8;i++){
    const a=i/8*Math.PI*2+fxRandom()*.4,l=16+fxRandom()*14;
    lines.push({n:svg('line',{stroke:color||'#ffe08a'},g),ux:Math.cos(a),uy:Math.sin(a),l});
   }
  }
  fxAnimate(g,520,t=>{
   const e=ease.outCubic(t);
   core.setAttribute('r',r1(8+30*e));core.setAttribute('fill-opacity',(1-t).toFixed(3));
   lines.forEach(q=>{const a0=10+q.l*e*.9,a1=a0+q.l*(1-e*.6);q.n.setAttribute('x1',r1(q.ux*a0));q.n.setAttribute('y1',r1(q.uy*a0));q.n.setAttribute('x2',r1(q.ux*a1));q.n.setAttribute('y2',r1(q.uy*a1));q.n.setAttribute('stroke-opacity',(1-t).toFixed(3));});
  });
 }
 function flashBadge(x,y,text,cls){
  if(!fxHigh)return;
  const g=svg('g',{class:'fu97-badge-fx '+(cls||''),transform:'translate('+r1(x)+' '+r1(y)+')'},fxHigh);
  const up=upGroup(g,false);
  const inner=svg('g',{class:'fu97-badge-fx-in'},up);
  const w=Math.max(96,text.length*15+34);
  svg('rect',{x:-w/2,y:-21,width:w,height:42,rx:21},inner);
  const t=svg('text',{y:8,'text-anchor':'middle'},inner);t.textContent=text;
  fxAnimate(g,1450,k=>{
   const a=k<.15?k/.15:k>.8?Math.max(0,1-(k-.8)/.2):1,s=k<.15?.7+.3*ease.outCubic(k/.15):1,dy=k<.15?10*(1-k/.15):k>.8?-12*(k-.8)/.2:0;
   inner.setAttribute('transform','translate(0 '+r1(dy)+') scale('+s.toFixed(3)+')');
   inner.setAttribute('fill-opacity',a.toFixed(3));inner.setAttribute('stroke-opacity',a.toFixed(3));
  });
 }
 // Huellas de la jugada: las acciones de la CPU quedan numeradas (1-2-3) hasta que vuelve a jugar el usuario.
 function ghostArrow(a,b,team,step){
  if(!ghostG)return;
  const len=Math.hypot(b.x-a.x,b.y-a.y);if(len<30)return;
  const ux=(b.x-a.x)/len,uy=(b.y-a.y)/len,cpu=team===CPU_TEAM&&cpuAutoEnabled;
  const g=svg('g',{class:'fu97-ghost-g'+(cpu?' is-cpu':'')},ghostG);
  svg('line',{class:'fu97-ghost fu97-ghost-t'+team+(cpu?' is-persist':''),x1:r1(a.x+ux*34),y1:r1(a.y+uy*34),x2:r1(b.x-ux*40),y2:r1(b.y-uy*40),'marker-end':team===1?'url(#fu97ArrowLime)':'url(#fu97ArrowAmber)'},g);
  if(cpu&&step){
   const m=svg('g',{class:'fu97-ghost-step',transform:'translate('+r1((a.x+b.x)/2)+' '+r1((a.y+b.y)/2)+')'},g);
   const up=upGroup(m,false);
   svg('circle',{r:15},up);
   const t=svg('text',{y:6,'text-anchor':'middle'},up);t.textContent=String(step);
  }
  while(ghostG.childNodes.length>9)ghostG.removeChild(ghostG.firstChild);
  // Las de la CPU se ven durante su turno y unos segundos después; el relato conserva la jugada.
  if(!cpu)fxLater(g,3200);else fadeLater(g,6500);
 }
 function clearCpuGhosts(){if(ghostG)ghostG.querySelectorAll('.is-cpu').forEach(n=>n.remove());}
 // Inicio de cualquier animación de acción: se limpia la guía táctica para que la jugada se lea limpia.
 function onActionStart(){
  targetsG.innerHTML='';rangeG.innerHTML='';clearReach();clearPreview();
  boardEl.classList.add('fu97-anim');
  if(stateIsLive()){
   const cpuActing=turn===CPU_TEAM&&cpuAutoEnabled;
   if(!cpuActing||actionNo===1)clearCpuGhosts();
  }
  Promise.resolve().then(syncHud);
 }

 // ---------------------------------------------------------------- fichas
 function tokenNode(x){
  const k=kit(x.t),gk=x.n===1;
  const g=svg('g',{
   class:'player fu97-tk fu97-t'+x.t+(gk?' fu97-gk':'')+(x.id===selected?' sel':'')+(recommendation&&recommendation.playerId===x.id?' advisor-player':''),
   transform:'translate('+X(x.c)+' '+Y(x.r)+')','aria-label':'Jugador '+x.n+' · '+teamName(x.t)
  });
  g.dataset.id=x.id;
  // Zona táctil más grande (radio 48 en casillas de 100): ayuda en celulares sin tapar casillas vecinas.
  svg('circle',{class:'fu97-tk-hit',r:48},g);
  const up=upGroup(g,true);
  svg('ellipse',{class:'fu97-tk-shadow',cx:0,cy:0,rx:34,ry:14.5,transform:'translate(3 15)'},up);
  svg('circle',{class:'fu97-tk-halo',r:TK.halo},up);
  svg('circle',{class:'fu97-tk-sel',r:TK.sel},up);
  svg('circle',{class:'fu97-tk-must',r:TK.sel-2},up);
  const body=svg('g',{class:'fu97-tk-body'},up);
  // Canto de la ficha: le da volumen de pieza de mesa.
  svg('circle',{class:'fu97-tk-edge',cy:4.5,r:TK.rim,fill:k.accent},body);
  svg('circle',{class:'fu97-tk-edge-dk',cy:4.5,r:TK.rim},body);
  svg('circle',{class:'fu97-tk-rim',r:TK.rim,fill:k.accent},body);
  svg('circle',{class:'fu97-tk-base',r:TK.body,fill:gk?dark(k.primary):k.primary},body);
  if(!gk&&k.pattern!=='plain'){
   const pg=svg('g',{class:'fu97-tk-kit','clip-path':'url(#fu97TkClip)',fill:k.secondary},body);
   kitShapes(k.pattern,TK.body).forEach(sh=>svg(sh[0],sh[1],pg));
  }
  if(gk)svg('circle',{class:'fu97-tk-gk',r:24,fill:'none',stroke:k.accent},body);
  svg('path',{class:'fu97-tk-collar',d:'M-10 -29.4Q0 -19.6 10 -29.4',stroke:k.accent},body);
  svg('circle',{class:'fu97-tk-shade',r:TK.body,fill:'url(#fu97TkShade)'},body);
  svg('ellipse',{class:'fu97-tk-gloss',cx:-5.5,cy:-16,rx:17,ry:8.8,fill:'url(#fu97TkGloss)'},body);
  const num=svg('text',{class:'fu97-tk-num',y:10.6,fill:k.number,stroke:numberStroke(k.number)},body);
  num.textContent=x.n;
  const badge=svg('g',{class:'fu97-tk-done',transform:'translate(25 -25)'},up);
  svg('circle',{r:10.5},badge);
  svg('path',{d:'M-4.6 .2-1.2 3.6 5 -3.4'},badge);
  g.addEventListener('click',e=>{e.stopPropagation();clickP(x);});
  return g;
 }
 function decorateTokens(){
  if(!stateIsLive())return;
  const o=owner(),must=new Set();
  if(kickoffPassRequired){const k=p.find(z=>isKickoffKicker(z));if(k)must.add(k.id);}
  if(freeKickRequiredId!==null&&freeKickAwardedTeam===turn&&actionNo===1)must.add(freeKickRequiredId);
  const humanTurn=!isCpuTurn()&&!matchClockFinished;
  playersG.querySelectorAll('.player').forEach(n=>{
   const id=+n.dataset.id,x=p.find(z=>z.id===id);if(!x)return;
   const acted=x.t===turn&&(playedThisTurn.includes(id)||(actionNo>1&&id===lastPlayedId));
   n.classList.toggle('fu97-acted',acted&&!matchClockFinished);
   n.classList.toggle('fu97-must',must.has(id)&&x.t===turn&&!anim);
   n.classList.toggle('fu97-carrier',!!o&&o.id===id);
   n.classList.toggle('fu97-active-team',x.t===turn&&humanTurn);
  });
 }

 // ---------------------------------------------------------------- balón
 let ballLift=null,ballSpinG=null,ballShadowEl=null,ballSpin=0,pendingBallRedraw=false;
 function buildBall(){
  ballG.innerHTML='';
  ballG.classList.add('fu97-ball');
  const up=upGroup(ballG,true);up.dataset.ball='1';
  {const t0=upT(true,true);if(t0)up.setAttribute('transform',t0);}
  ballShadowEl=svg('ellipse',{class:'fu97-ball-shadow',cx:0,cy:0,rx:14,ry:6,transform:'translate(2 10)'},up);
  ballLift=svg('g',{class:'fu97-ball-lift'},up);
  svg('circle',{class:'fu97-ball-base',r:13,fill:'url(#fu97BallBase)'},ballLift);
  ballSpinG=svg('g',{class:'fu97-ball-spin','clip-path':'url(#fu97BallClip)'},ballLift);
  const panel='M0,-4.9 4.7,-1.5 2.9,3.9 -2.9,3.9 -4.7,-1.5Z';
  svg('path',{d:panel,class:'fu97-ball-panel'},ballSpinG);
  for(let i=0;i<5;i++){
   const a=i*72;
   svg('path',{d:panel,class:'fu97-ball-panel',transform:'rotate('+a+') translate(0 -12.4) rotate(180) scale(.92)'},ballSpinG);
   svg('path',{d:'M0 -4.9V-8.2',class:'fu97-ball-seam',transform:'rotate('+a+')'},ballSpinG);
  }
  svg('circle',{class:'fu97-ball-shade',r:13,fill:'url(#fu97BallShade)'},ballLift);
  svg('circle',{class:'fu97-ball-edge',r:13},ballLift);
  svg('ellipse',{class:'fu97-ball-glint',cx:-4.6,cy:-5.8,rx:4.2,ry:2.1,transform:'rotate(-35 -4.6 -5.8)'},ballLift);
 }
 function setBallPose(h,spin){
  if(!ballLift)return;
  const s=1+h/92;
  ballLift.setAttribute('transform',h>0.05?'translate(0 '+r1(-h)+') scale('+s.toFixed(3)+')':'');
  const sh=Math.max(.38,1-h/78);
  ballShadowEl.setAttribute('transform','translate('+r1(2+h*.22)+' '+r1(10+h*.3)+') scale('+sh.toFixed(3)+')');
  ballShadowEl.setAttribute('fill-opacity',(.3+.7*sh).toFixed(2));
  if(spin!==undefined){ballSpin=spin%360;ballSpinG.setAttribute('transform','rotate('+r1(ballSpin)+')');}
 }
 function ballOffset(){return vertical?{x:-31,y:33}:{x:29,y:27};}
 function cellPoint(c,r){return {x:X(c),y:Y(r)};}
 function ballPoint(q){const pt=cellPoint(q.c,q.r);if(owned(q)){const o=ballOffset();pt.x+=o.x;pt.y+=o.y;}return pt;}

 // ---------------------------------------------------------------- guía táctica (modo pase/remate)
 function rectPath(q){return 'M'+q.x+' '+q.y+'h'+q.w+'v'+q.h+'h'+(-q.w)+'Z';}
 function clearReach(){cells.querySelectorAll('.fu97-reach').forEach(n=>n.classList.remove('fu97-reach'));}
 function pill(parent,x,y,text,cls,anchor){
  const g=svg('g',{class:'fu97-pill '+(cls||''),transform:'translate('+r1(x)+' '+r1(y)+')'},parent);
  const up=upGroup(g,false);
  const big=vertical,fsz=big?24:17,hh=big?42:34;
  const w=Math.max(46,text.length*fsz*.74+22);
  const dx=anchor==='end'?-w:anchor==='start'?0:-w/2;
  svg('rect',{x:r1(dx),y:-hh/2,width:r1(w),height:hh,rx:hh/2},up);
  const t=svg('text',{x:r1(dx+w/2),y:r1(fsz*.38),'text-anchor':'middle'},up);t.textContent=text;
  return g;
 }
 function laneStatus(x,from,z){
  const to={c:z.c,r:z.r};
  const lane=trajectoryInterceptionRisk(from,to,x.t,p);
  if(lane.blocked)return {status:'blocked',label:'BLOQUEADO',lane};
  if(isOffsidePosition(z)||passBeyondOffsideLine(to.c,x))return {status:'offside',label:'ADELANTADO',lane};
  if(lane.risk>0)return {status:'risk',label:'RIESGO '+Math.round(lane.risk*100)+'%',lane};
  return {status:'free',label:'LIBRE',lane};
 }
 // Escala de color para porcentajes del motor (precisión del pase o llegada al receptor).
 function precisionTier(v){return v>=.8?'p5':v>=.6?'p4':v>=.45?'p3':v>=.3?'p2':'p1';}
 function ballCurve(a,b,passer,dist,arc){
  const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,perp={x:-dy/len,y:dx/len};
  const curve=(arc&&dist>0)?(passer&&passer.n===10?Math.min(68,20+dist*7):Math.min(42,12+dist*5)):0;
  return {x:(a.x+b.x)/2+perp.x*curve,y:(a.y+b.y)/2+perp.y*curve};
 }
 function newRebuildBallTargets(){
  targetsG.innerHTML='';
  rangeG.innerHTML='';
  clearReach();
  clearPreview();
  const x=active();
  if(mode!=='ball'||!x||selected!==x.id||anim||!stateIsLive())return;
  const from={c:ball.c,r:ball.r},cx=X(ball.c),cy=Y(ball.r);
  const reach=BALL_REACH(x.n);
  cells.querySelectorAll('.cell').forEach(q=>{if(bLegal(+q.dataset.c,+q.dataset.r))q.classList.add('fu97-reach');});
  // 1) Precisión del pase por distancia: el mismo modelo que usa el motor (v96) para ejecutar y para la IA.
  const zones=svg('g',{class:'fu97-zones','clip-path':'url(#fu97FieldClip)'},rangeG);
  const sq=d=>({x:cx-(d+.5)*S,y:cy-(d+.5)*S,w:(2*d+1)*S,h:(2*d+1)*S});
  // Se agrupan las distancias con el mismo nivel: tinte suave, sin bordes.
  const tiers=[];
  for(let d=1;d<=reach;d++){
   const tier=precisionTier(estimatedPassPrecision(x,from,{c:from.c+d,r:from.r}));
   if(tiers.length&&tiers[tiers.length-1].tier===tier)tiers[tiers.length-1].to=d;
   else tiers.push({tier,from:d,to:d});
  }
  tiers.forEach(t=>{
   svg('path',{d:rectPath(sq(t.to))+' '+rectPath(sq(t.from-1)),'fill-rule':'evenodd',class:'fu97-zone is-'+t.tier},zones);
  });
  // 2) Receptores: carril libre, con riesgo, bloqueado o adelantado (funciones de evaluación del motor).
  //    Sin carriles dibujados hacia todos: el recorrido y el detalle aparecen al apuntar un destino (vista previa).
  const rings=svg('g',{class:'fu97-receivers'},targetsG);
  p.forEach(z=>{
   if(z.t!==x.t||z.id===x.id)return;
   const to={c:z.c,r:z.r},dist=cheb(from,to);
   if(dist>reach)return;
   const st=laneStatus(x,from,z);
   const success=st.status==='blocked'||st.status==='offside'?0:estimatedPassPrecision(x,from,to)*(1-st.lane.risk);
   const b=cellPoint(z.c,z.r);
   const rg=svg('g',{class:'fu97-rcv is-'+st.status,transform:'translate('+b.x+' '+b.y+')'},rings);
   svg('circle',{r:41},rg);
   if(st.status==='blocked'||st.status==='offside'){
    const ic=svg('g',{class:'fu97-rcv-icon',transform:'translate(-29 -29)'},rg);
    svg('circle',{r:11},ic);
    svg('path',{d:st.status==='blocked'?'M-4.5-4.5 4.5 4.5M4.5-4.5-4.5 4.5':'M-3.5 5.5V-6M-3.5-6H5L2.5-3 5 0H-3.5'},ic);
   }
   // Un solo número por compañero (probabilidad de que llegue); el riesgo lo dice el color del anillo y de la
   // etiqueta. Bloqueado o adelantado: solo el ícono. En la última fila la etiqueta va arriba para no cortarse.
   if(st.status==='free'||st.status==='risk'){
    const below=z.r<R-1;
    pill(rings,b.x,b.y+(below?58:-58),Math.round(success*100)+'%','fu97-rcv-pill is-'+st.status+' is-'+precisionTier(success));
   }
  });
  // 3) Remates: casillas habilitadas y probabilidad de gol estimada por el motor (sin líneas de tiro).
  const side=x.t===1?'R':'L',goalC=side==='R'?C-1:0;
  const shots=[];
  for(let r=4;r<=6;r++){
   const end={c:goalC,r};
   if(cheb(from,end)>reach)continue;
   shots.push({end,est:estimateShotProbability(x,from,end,p)});
  }
  if(shots.length){
   const sg=svg('g',{class:'fu97-shots'},targetsG);
   shots.forEach(s=>{
    const pct=Math.round(s.est.probability*100);
    const tier=pct<=0?'none':pct<20?'low':pct<45?'mid':'high';
    const ex=X(s.end.c),ey=Y(s.end.r);
    svg('circle',{class:'fu97-shot-end is-'+tier,cx:ex,cy:ey,r:16},sg);
    pill(sg,ex+(side==='R'?-30:30),ey,pct+'%','fu97-shot-pill is-'+tier,side==='R'?'end':'start');
   });
  }
 }

 // ---------------------------------------------------------------- vista previa al pasar el cursor (escritorio)
 let previewKey='';
 function clearPreview(){previewKey='';if(previewG)previewG.innerHTML='';}
 function previewFor(c,r){
  if(anim||!stateIsLive()||isCpuTurn()||matchClockFinished){clearPreview();return;}
  const key=mode+':'+selected+':'+c+':'+r;
  if(key===previewKey)return;
  clearPreview();previewKey=key;
  const x=selected!==null?p.find(z=>z.id===selected):null;
  if(!x||x.t!==turn)return;
  if(mode==='player'){
   const cell=cells.querySelector('.cell[data-c="'+c+'"][data-r="'+r+'"]');
   if(!cell||!cell.classList.contains('pl'))return;
   const isDuel=cell.classList.contains('duel');
   const a=cellPoint(x.c,x.r),b=cellPoint(c,r),len=Math.hypot(b.x-a.x,b.y-a.y)||1,ux=(b.x-a.x)/len,uy=(b.y-a.y)/len;
   svg('line',{class:'fu97-pv-move'+(isDuel?' is-duel':''),x1:r1(a.x+ux*34),y1:r1(a.y+uy*34),x2:r1(b.x-ux*(isDuel?40:20)),y2:r1(b.y-uy*(isDuel?40:20)),'marker-end':isDuel?'url(#fu97ArrowOrange)':'url(#fu97ArrowLime)'},previewG);
   if(!isDuel)svg('circle',{class:'fu97-pv-ghost',cx:b.x,cy:b.y,r:TK.rim},previewG);
   pill(previewG,b.x,b.y-56,isDuel?'DISPUTA':'MOVER','fu97-pv-pill'+(isDuel?' is-duel':''));
   return;
  }
  if(mode==='ball'&&bLegal(c,r)){
   const from={c:ball.c,r:ball.r},to={c,r},dist=cheb(from,to);
   const a=ballPoint({c:ball.c,r:ball.r,owner:x.id}),b=cellPoint(c,r),ctrl=ballCurve(a,b,x,dist,true);
   const path=passPathCells(from,to),first=firstTrajectoryRival(path,x.t);
   const precision=estimatedPassPrecision(x,from,to);
   const lane=trajectoryInterceptionRisk(from,to,x.t,p);
   const blocked=!!(first&&first.index===0);
   const mate=at(c,r,x.id);
   const goalSide=goalSideForCell(c,r,x.t);
   let cls='is-'+precisionTier(precision),label='PRECISIÓN '+Math.round(precision*100)+'%';
   if(blocked){cls='is-blocked';label='BLOQUEADO';}
   else if(kickoffPassRequired&&!(mate&&mate.t===x.t)){cls='is-blocked';label='SAQUE: A UN COMPAÑERO';}
   else if(restartPassOnlyId===x.id&&goalSide){cls='is-blocked';label='SAQUE DE BANDA: SOLO PASE';}
   else if(mate&&mate.t===x.t&&(isOffsidePosition(mate)||passBeyondOffsideLine(c,x))){cls='is-blocked';label='ADELANTADO';}
   else if(passBeyondOffsideLine(c,x)){cls='is-blocked';label='MÁS ALLÁ DEL ANTEÚLTIMO';}
   else if(goalSide){const est=estimateShotProbability(x,from,to,p);label='GOL '+Math.round(est.probability*100)+'%';cls='is-goal';}
   else if(mate&&mate.t===x.t){const ok=precision*(1-lane.risk);label='LLEGA '+Math.round(ok*100)+'%'+(lane.risk>0?' · RIESGO':'');cls='is-'+precisionTier(ok)+(lane.risk>0?' is-risk':'');}
   else if(lane.risk>0){label+=' · RIESGO '+Math.round(lane.risk*100)+'%';cls+=' is-risk';}
   svg('path',{class:'fu97-pv-pass '+cls,d:'M'+r1(a.x)+' '+r1(a.y)+'Q'+r1(ctrl.x)+' '+r1(ctrl.y)+' '+b.x+' '+b.y,'marker-end':blocked?'url(#fu97ArrowRed)':'url(#fu97ArrowCyan)'},previewG);
   if(first){const fp=cellPoint(first.player.c,first.player.r);svg('circle',{class:'fu97-pv-threat'+(blocked?' is-blocked':''),cx:fp.x,cy:fp.y,r:40},previewG);}
   svg('circle',{class:'fu97-pv-target '+cls,cx:b.x,cy:b.y,r:22},previewG);
   pill(previewG,b.x,b.y-56,label,'fu97-pv-pill '+cls);
  }
 }
 function hookPreview(){
  const mouse=e=>e.pointerType==='mouse'||e.pointerType==='pen';
  fuListen(cells,'pointerover',e=>{if(!mouse(e))return;const q=e.target.closest&&e.target.closest('.cell');if(q)previewFor(+q.dataset.c,+q.dataset.r);});
  fuListen(playersG,'pointerover',e=>{
   if(!mouse(e))return;
   const n=e.target.closest&&e.target.closest('.player');if(!n||!stateIsLive())return;
   const z=p.find(q=>q.id===+n.dataset.id);if(!z)return;
   if(mode==='ball'||(selected!==null&&z.id!==selected))previewFor(z.c,z.r);else clearPreview();
  });
  fuListen(fieldEl,'pointerleave',clearPreview);
 }

 // ---------------------------------------------------------------- animaciones
 // Duraciones idénticas al motor (incluida la cámara lenta de la CPU) y mismas posiciones finales.
 function track(start,duration,xAt,finalX,ids,priority){
  if(typeof fuV963TrackAction==='function')return fuV963TrackAction(start,duration,xAt,finalX,ids,priority);
  return Promise.resolve(start());
 }
 function makeStreak(color){
  if(reducedMotion()||!fxLow)return null;
  return svg('polygon',{class:'fu97-streak',fill:color||'#ffffff'},fxLow);
 }
 function updateStreak(st,a,cur,w){
  if(!st)return;
  const dx=cur.x-a.x,dy=cur.y-a.y,len=Math.hypot(dx,dy);
  if(len<4){st.setAttribute('points','');return;}
  const ux=dx/len,uy=dy/len,tl=Math.min(len,150),tx=cur.x-ux*tl,ty=cur.y-uy*tl,px=-uy*w,py=ux*w;
  st.setAttribute('points',r1(tx)+','+r1(ty)+' '+r1(cur.x+px)+','+r1(cur.y+py)+' '+r1(cur.x-px)+','+r1(cur.y-py));
 }
 function fadeOut(node,ms){if(!node)return;node.classList.add('is-out');fxLater(node,ms||320);}
 // Pulsos de la ficha (patada, recepción, atajada, golpe) con atributos SVG animados por JS:
 // las animaciones CSS de transform/opacity dentro del SVG crean capas compuestas y encarecen el repintado.
 const PULSES={
  kick:{ms:340,f:t=>'scale('+(1+.12*Math.sin(Math.PI*Math.min(1,t/.7))).toFixed(3)+')'},
  receive:{ms:400,f:t=>'scale('+(1+.1*Math.sin(Math.PI*t)).toFixed(3)+')'},
  catch:{ms:680,f:t=>'scale('+(1+.22*Math.sin(Math.PI*Math.min(1,t/.45))*(t<.45?1:Math.max(0,1-(t-.45)/.55*1.3))).toFixed(3)+')'},
  hit:{ms:380,f:t=>'translate('+r1(Math.sin(t*Math.PI*6)*4*(1-t))+' 0)'}
 };
 function pulseToken(id,kind){
  if(reducedMotion())return;
  const n=nodePlayer(id),b=n&&n.querySelector('.fu97-tk-body'),cfg=PULSES[kind];
  if(!b||!cfg)return;
  const token={};b.__fu97Pulse=token;
  rafAnimate(cfg.ms,t=>{if(b.__fu97Pulse===token)b.setAttribute('transform',cfg.f(t));}).then(()=>{if(b.__fu97Pulse===token){b.removeAttribute('transform');b.__fu97Pulse=null;}});
 }
 // Animación por atributos para efectos efímeros (sin capas compuestas).
 function fxAnimate(node,ms,frame){
  if(!node)return;
  rafAnimate(ms,t=>{if(node.parentNode)frame(t);}).then(()=>{if(node.parentNode)node.parentNode.removeChild(node);});
 }
 async function moveCore(id,a,b,duration,slow,eFn){
  const n=nodePlayer(id);
  if(!n)return;
  const body=n.querySelector('.fu97-tk-body'),shadow=n.querySelector('.fu97-tk-shadow');
  const carrying=ball.owner===id,off=ballOffset(),fx=!reducedMotion();
  const len=Math.hypot(b.x-a.x,b.y-a.y);
  const steps=slow?Math.max(2,Math.round(len/60)):Math.max(1,Math.round(len/115));
  const z=p.find(q=>q.id===id),streak=!slow&&len>0?makeStreak(z?kit(z.t).primary:'#fff'):null;
  const actionStep=stateIsLive()?actionNo:0;
  n.classList.add('fu97-moving');
  let spin=ballSpin;
  const spinRate=len/13*57.3;
  await rafAnimate(duration,t=>{
   const e=eFn(t),x=a.x+(b.x-a.x)*e,y=a.y+(b.y-a.y)*e;
   setPlayerVisual(id,x,y);
   if(fx&&body){
    const hop=Math.abs(Math.sin(Math.PI*t*steps))*(slow?3.2:6.5);
    body.setAttribute('transform','translate(0 '+r1(-hop)+')');
    if(shadow)shadow.setAttribute('transform','translate(3 15) scale('+(1-hop/34).toFixed(3)+')');
   }
   if(carrying){setBallVisual(x+off.x,y+off.y,1);if(fx)setBallPose(0,spin+spinRate*e);}
   if(streak)updateStreak(streak,a,{x,y},20*Math.sin(Math.PI*Math.min(1,t*1.2)));
  });
  setPlayerVisual(id,b.x,b.y);
  if(body)body.removeAttribute('transform');
  if(shadow)shadow.setAttribute('transform','translate(3 15)');
  if(carrying){setBallVisual(b.x+off.x,b.y+off.y,1);setBallPose(0,spin+spinRate);}
  n.classList.remove('fu97-moving');
  if(streak)fadeOut(streak);
  if(fx&&len>0)dustPuff(b.x,b.y+16);
  if(len>0&&!slow)ghostArrow(a,b,z?z.t:1,actionStep);
 }
 function newAnimatePlayerMove(id,from,to,options){
  options=options||{};
  const slow=!!options.slow,dist=cheb(from,to);
  const baseDur=slow?1100+dist*300:255+Math.max(0,dist-1)*120;
  const duration=Math.round(baseDur*(slowCpuVisuals?(slow?1.25:2.0):1));
  const a=cellPoint(from.c,from.r),b=cellPoint(to.c,to.r);
  const eFn=slow?ease.inOutSine:ease.inOutCubic;
  const xAt=t=>a.x+(b.x-a.x)*eFn(t);
  onActionStart();
  return track(()=>moveCore(id,a,b,duration,slow,eFn),duration,xAt,b.x,[id],2);
 }

 // Plan de vuelo del balón: rodado, globo con rebote, remate potente, gol con red, atajada, desvío.
 function planBallFlight(from,to,options){
  const arc=options.arc===undefined?true:!!options.arc,goal=!!options.goal;
  const dist=cheb(from,to);
  const baseDur=options.duration??Math.round((315+dist*72)*(goal?1:2));
  const dur=Math.round(baseDur*(slowCpuVisuals?1.55:1));
  const travel=goal?Math.max(dur,1750):dur,settle=goal?170:90;
  const passer=p.find(z=>z.id===from.owner)||null;
  const shooterTeam=passer?passer.t:(turn||1);
  const a=ballPoint(from),b=ballPoint(to);
  const ctrl=ballCurve(a,b,passer,dist,arc);
  const toPlayer=owned(to)?p.find(z=>z.id===to.owner):null;
  const kind=goal?(owned(to)?'save':(goalSideForCell(to.c,to.r,shooterTeam)?'goal':'miss')):(owned(to)?'pass':(at(to.c,to.r)&&!arc?'deflect':'loose'));
  const replay=kind==='goal'&&baseDur>=2000;
  const lofted=!goal&&arc&&dist>=4;
  const H=goal?Math.min(34,10+dist*3):lofted?Math.min(62,10+dist*6.5):(arc&&options.duration&&options.duration<=330?16:0);
  // Fracción del viaje en la que el balón llega: los remates son rápidos y el resto se usa para la red/atajada.
  const arrive=kind==='goal'?(replay?.72:.5):kind==='save'?(replay?.7:.52):kind==='miss'?.56:1;
  let net=null,netEnd=null;
  if(kind==='goal'){
   const side=to.c===0?'L':'R',gp=goalParts[side];
   if(gp){net=gp;netEnd={x:gp.back-gp.dir*12,y:Math.max(gp.top+26,Math.min(gp.bot-26,b.y+(b.y-a.y)*.12))};}
  }
  const bez=(e,p0,p1,p2)=>{const u=1-e;return u*u*p0+2*u*e*p1+e*e*p2;};
  function posAt(t){
   // t: progreso normalizado del viaje completo (0..1).
   if(t<=arrive||!(arrive<1)){
    const k=arrive<1?t/arrive:t;
    const e=goal?ease.outQuart(Math.min(1,k)):lofted?ease.inOutSine(k):kind==='deflect'?ease.outCubic(k):ease.outCubic(k);
    const x=bez(e,a.x,ctrl.x,b.x),y=bez(e,a.y,ctrl.y,b.y);
    let h=0;
    if(H>0){
     if(lofted){h=e<.84?H*4*(e/.84)*(1-e/.84):H*.16*4*((e-.84)/.16)*(1-(e-.84)/.16);}
     else h=H*4*e*(1-e)*(goal?.9:1);
    }
    return {x,y,h,e};
   }
   const k=(t-arrive)/(1-arrive);
   if(kind==='goal'&&netEnd){
    const e=ease.outCubic(Math.min(1,k*1.35));
    return {x:b.x+(netEnd.x-b.x)*e,y:b.y+(netEnd.y-b.y)*e,h:Math.max(0,(1-e)*6),e:1,post:k};
   }
   if(kind==='miss'){
    const e=ease.outCubic(k),bounce=Math.abs(Math.sin(Math.PI*e*2))*10*(1-e);
    return {x:b.x,y:b.y,h:bounce,e:1,post:k};
   }
   return {x:b.x,y:b.y,h:0,e:1,post:k};
  }
  return {from,to,a,b,ctrl,kind,replay,lofted,goal,arc,dist,travel,settle,total:travel+settle,posAt,toPlayer,shooterTeam,arrive,net,netEnd,passer,step:stateIsLive()?actionNo:0};
 }
 function makeTrail(hot){
  if(!fxHigh)return null;
  return svg('polygon',{class:'fu97-trail'+(hot?' is-hot':'')},fxHigh);
 }
 function drawTrail97(poly,pts,width){
  if(!poly)return;
  if(pts.length<2){poly.setAttribute('points','');return;}
  const left=[],right=[];
  for(let i=0;i<pts.length;i++){
   const q=pts[i],nx=pts[Math.min(pts.length-1,i+1)],pv=pts[Math.max(0,i-1)];
   let dx=nx.x-pv.x,dy=nx.y-pv.y;const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;
   const w=width*(i/(pts.length-1));
   left.push(r1(q.x-dy*w)+','+r1(q.y+dx*w));right.push(r1(q.x+dy*w)+','+r1(q.y-dx*w));
  }
  poly.setAttribute('points',left.concat(right.reverse()).join(' '));
 }
 function animateNet(gp,ms){
  if(!gp||!gp.net||reducedMotion())return;
  rafAnimate(ms,t=>{
   const bulge=Math.sin(Math.PI*Math.min(1,t*1.6))*28*(1-t*.55)+Math.sin(t*Math.PI*5)*5*(1-t);
   gp.net.setAttribute('d',gp.netD(bulge));
   gp.backLine.setAttribute('d','M'+gp.back+' '+(gp.top+8)+'Q'+(gp.back+gp.dir*bulge)+' 550 '+gp.back+' '+(gp.bot-8));
  }).then(()=>{gp.net.setAttribute('d',gp.netD(0));gp.backLine.setAttribute('d','M'+gp.back+' '+(gp.top+8)+'Q'+gp.back+' 550 '+gp.back+' '+(gp.bot-8));});
 }
 async function ballCore(plan){
  const fx=!reducedMotion();
  const hot=plan.goal;
  const trail=fx?makeTrail(hot):null;
  const pts=[];
  const spin0=ballSpin,spinTotal=(Math.hypot(plan.b.x-plan.a.x,plan.b.y-plan.a.y)/13)*57.3*(plan.lofted?.45:1);
  if(plan.replay)boardEl.classList.add('fu97-replay');
  if(plan.kind==='goal'||plan.kind==='save'||plan.kind==='miss')boardEl.classList.add('fu97-shooting');
  if(plan.passer&&fx)pulseToken(plan.passer.id,'kick');
  let arrivedFx=false,netFx=false;
  await rafAnimate(plan.travel,t=>{
   const q=plan.posAt(t);
   setBallVisual(q.x,q.y,1);
   setBallPose(q.h,spin0+spinTotal*Math.min(1,q.e));
   if(trail){
    pts.push({x:q.x,y:q.y-q.h});
    const maxPts=plan.goal?(plan.replay?22:15):12;
    while(pts.length>maxPts)pts.shift();
    if(t>=plan.arrive&&pts.length>1)pts.shift();
    drawTrail97(trail,pts,plan.goal?9:6.5);
   }
   if(!arrivedFx&&t>=plan.arrive){
    arrivedFx=true;
    if(plan.kind==='goal'&&!netFx){netFx=true;animateNet(plan.net,plan.replay?1100:820);if(fx)sparkBurst(plan.b.x,plan.b.y,'#ffe08a');}
    else if(plan.kind==='save'){
     sparkBurst(plan.b.x,plan.b.y,'#bfefff');
     if(plan.toPlayer&&fx)pulseToken(plan.toPlayer.id,'catch');
     flashBadge(plan.b.x,plan.b.y-70,'¡ATAJADA!','is-save');
    }else if(plan.kind==='miss'){flashBadge(plan.b.x,plan.b.y-62,'¡AFUERA!','is-miss');}
   }
  });
  setBallVisual(plan.b.x,plan.b.y,1);
  if(plan.kind==='goal'&&plan.netEnd){const q=plan.posAt(1);setBallVisual(q.x,q.y,1);}
  // Asentamiento (misma duración que el motor).
  const end=plan.kind==='goal'&&plan.netEnd?plan.posAt(1):{x:plan.b.x,y:plan.b.y};
  await rafAnimate(plan.settle,t=>{
   const h=plan.kind==='loose'||plan.kind==='deflect'?Math.sin(Math.PI*t)*4:0;
   setBallVisual(end.x,end.y,1);setBallPose(h);
   if(trail&&pts.length>1){pts.shift();drawTrail97(trail,pts,plan.goal?9:6.5);}
  });
  setBallVisual(end.x,end.y,1);
  setBallPose(0);
  if(trail)fadeOut(trail,200);
  if(plan.replay)boardEl.classList.remove('fu97-replay');
  boardEl.classList.remove('fu97-shooting');
  if(plan.kind==='pass'&&plan.toPlayer){
   if(fx)pulseToken(plan.toPlayer.id,'receive');
   ghostArrow(plan.a,{x:plan.b.x-ballOffset().x,y:plan.b.y-ballOffset().y},plan.toPlayer.t,plan.step);
  }else if(plan.kind==='deflect'){
   sparkBurst(plan.b.x,plan.b.y,'#ffb36b');
   const z=at(plan.to.c,plan.to.r);if(z&&fx)pulseToken(z.id,'hit');
  }
 }
 function newAnimateBall(from,to,options){
  options=options||{};
  onActionStart();
  const plan=planBallFlight(from,to,options);
  const total=plan.total;
  const xAt=t=>{const ms=t*total;return ms>=plan.travel?(plan.kind==='goal'&&plan.netEnd?plan.netEnd.x:plan.b.x):plan.posAt(Math.min(1,ms/plan.travel)).x;};
  const ids=[from.owner,to.owner].filter((id,i,arr)=>id!==null&&id!==undefined&&arr.indexOf(id)===i);
  return track(()=>ballCore(plan),total,xAt,plan.b.x,ids,1);
 }
 async function duelCore(attackerId,rivalId,fromA,toA,fromR,toR,ballFrom,ballTo,result,duration){
  const fx=!reducedMotion();
  const a0=cellPoint(fromA.c,fromA.r),a1=cellPoint(toA.c,toA.r);
  const q0=cellPoint(fromR.c,fromR.r),q1=cellPoint(toR.c,toR.r);
  const ball0=ballPoint({c:ballFrom.c,r:ballFrom.r,owner:rivalId}),ball1=ballPoint(ballTo);
  const movingBall=ballFrom.c!==ballTo.c||ballFrom.r!==ballTo.r;
  const trail=fx&&movingBall?makeTrail(false):null,pts=[];
  const nr=nodePlayer(rivalId),na=nodePlayer(attackerId);
  let impact=false;
  await rafAnimate(duration,t=>{
   const e=easeInOut(t);
   let ax=a0.x+(a1.x-a0.x)*e,ay=a0.y+(a1.y-a0.y)*e;
   if(result==='atras'){
    const approach=Math.min(1,e/.46),recoil=e<=.46?0:((e-.46)/.54);
    const ex=a0.x+(a1.x-a0.x)*approach,ey=a0.y+(a1.y-a0.y)*approach;
    ax=e<=.46?ex:ex+(a1.x-ex)*easeInOut(recoil);
    ay=e<=.46?ey:ey+(a1.y-ey)*easeInOut(recoil);
   }
   setPlayerVisual(attackerId,ax,ay);
   setPlayerVisual(rivalId,q0.x+(q1.x-q0.x)*e,q0.y+(q1.y-q0.y)*e);
   if(!impact&&e>=.42){
    impact=true;
    if(fx){
     const mx=(ax+q0.x+(q1.x-q0.x)*e)/2,my=(ay+q0.y+(q1.y-q0.y)*e)/2;
     sparkBurst(mx,my,'#ffd27a');
    }
   }
   const bt=clamp01((t-.20)/.62),be=easeInOut(bt);
   if(movingBall){
    const bx=ball0.x+(ball1.x-ball0.x)*be,by=ball0.y+(ball1.y-ball0.y)*be;
    setBallVisual(bx,by,1);setBallPose(Math.sin(Math.PI*bt)*9,ballSpin+be*30);
    if(trail){pts.push({x:bx,y:by-Math.sin(Math.PI*bt)*9});while(pts.length>10)pts.shift();drawTrail97(trail,pts,5);}
   }else{
    setBallVisual(ball1.x,ball1.y,1);setBallPose(Math.sin(Math.PI*Math.min(1,t/.55))*4);
   }
  });
  setPlayerVisual(attackerId,a1.x,a1.y);setPlayerVisual(rivalId,q1.x,q1.y);setBallVisual(ball1.x,ball1.y,1);setBallPose(0);
  if(trail)fadeOut(trail,200);
  // Mismo rebote final del motor (180 ms), aplicado al cuerpo de la ficha.
  const bodies=[na,nr].filter(Boolean).map(n=>n.querySelector('.fu97-tk-body')).filter(Boolean);
  await rafAnimate(180,t=>{const s=1+.11*Math.sin(Math.PI*t);bodies.forEach(b=>b.setAttribute('transform','scale('+s.toFixed(3)+')'));});
  bodies.forEach(b=>b.removeAttribute('transform'));
 }
 function newAnimateDuel(attackerId,rivalId,fromA,toA,fromR,toR,ballFrom,ballTo,options){
  options=options||{};
  const result=options.result||'frente';
  const duration=Math.round((result==='atras'?500:430)*(slowCpuVisuals?1.8:1));
  const xAt=t=>{const e=easeInOut(t);return ((X(fromA.c)+(X(toA.c)-X(fromA.c))*e)+(X(fromR.c)+(X(toR.c)-X(fromR.c))*e))/2;};
  const finalX=(X(toA.c)+X(toR.c))/2;
  onActionStart();
  return track(()=>duelCore(attackerId,rivalId,fromA,toA,fromR,toR,ballFrom,ballTo,result,duration),duration+180,xAt,finalX,[attackerId,rivalId],3);
 }

 // ---------------------------------------------------------------- dibujo principal
 function newDrawPlayers(){
  playersG.innerHTML='';
  const frag=document.createDocumentFragment();
  p.forEach(x=>frag.appendChild(tokenNode(x)));
  playersG.appendChild(frag);
  decorateTokens();
  syncKits();
 }
 function newDrawBall(xOverride,yOverride){
  let x=X(ball.c),y=Y(ball.r);const o=owner();
  if(o){const off=ballOffset();x+=off.x;y+=off.y;}
  const manual=Number.isFinite(xOverride)&&Number.isFinite(yOverride);
  if(manual){x=xOverride;y=yOverride;}
  ballG.setAttribute('transform','translate('+x+' '+y+')');
  setBallPose(0);
  pendingBallRedraw=false;
  state.textContent=o?'Balón: Jugador '+o.n+' · Equipo '+o.t:'Balón suelto · casilla '+(ball.c+1)+'×'+(ball.r+1);
  if(!manual)requestAnimationFrame(t=>{if(!layerFailed)followBallOnMobile(t);});
 }

 // ---------------------------------------------------------------- reorganización de paneles
 const ui={};
 const ICONS={
  status:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  legend:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="18" cy="16" r="3" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  match:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="7" r="2.4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="17" r="2.4" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  kit:'<svg viewBox="0 0 40 40" aria-hidden="true"><path d="'+SHIRT+'" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/></svg>',
  expand:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  collapse:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  zoom:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="m15 15 5 5M8 10.5h5M10.5 8v5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  pitch:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 12h12" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>'
 };
 const LEGEND=[
  ['<svg viewBox="0 0 24 24"><rect x="1" y="1" width="22" height="22" rx="4" fill="rgba(200,255,46,.12)"/><circle cx="12" cy="12" r="6.5" fill="none" stroke="#c8ff2e" stroke-opacity=".6" stroke-width="1.6"/><circle cx="12" cy="12" r="3" fill="#eaffb5"/></svg>','Movimiento','casilla disponible para la ficha elegida'],
  ['<svg viewBox="0 0 24 24"><rect x="1" y="1" width="22" height="22" rx="4" fill="rgba(255,138,31,.25)" stroke="#ff9a3c" stroke-width="1.4"/><path d="M8 8l8 8M16 8l-8 8" stroke="#ffd0a0" stroke-width="2.2" stroke-linecap="round"/></svg>','Disputa','entrar en la casilla del rival con balón'],
  ['<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="#5dffa8" stroke-width="2.4"/></svg>','Pase libre','sin rivales en la línea de pase'],
  ['<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="#ffc04a" stroke-width="2.4" stroke-dasharray="4 2.4"/></svg>','Con riesgo','un rival puede interceptar'],
  ['<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="#ff5d6c" stroke-width="2.4"/><path d="M8.6 8.6l6.8 6.8M15.4 8.6l-6.8 6.8" stroke="#ff5d6c" stroke-width="2" stroke-linecap="round"/></svg>','Bloqueado','rival pegado o receptor adelantado'],
  ['<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="3" fill="rgba(255,93,108,.35)"/><rect x="5" y="5" width="14" height="14" rx="2.5" fill="rgba(255,179,92,.5)"/><rect x="8" y="8" width="8" height="8" rx="2" fill="rgba(93,255,168,.8)"/></svg>','Precisión','verde alta · roja baja (distancia y dorsal)'],
  ['<svg viewBox="0 0 24 24"><rect x="1.5" y="6" width="21" height="12" rx="6" fill="#0b1118" stroke="#c8ff2e" stroke-width="1.4"/><text x="12" y="15.2" text-anchor="middle" font-size="8" font-weight="900" fill="#e9ffb0">%</text></svg>','Porcentajes','pase que llega · gol estimado (motor)'],
  ['<svg viewBox="0 0 24 24"><path d="M3 20 19 5" stroke="#ffc04a" stroke-width="2" stroke-dasharray="2 3.4" stroke-linecap="round"/><circle cx="11" cy="12.5" r="5" fill="#0b1118" stroke="#ffc04a" stroke-width="1.5"/><text x="11" y="15.4" text-anchor="middle" font-size="7.5" font-weight="900" fill="#ffe1a6">2</text></svg>','Jugada rival','recorrido numerado de la CPU'],
  ['<svg viewBox="0 0 24 24"><circle cx="11" cy="13" r="8" fill="#5a6577" opacity=".55"/><circle cx="17.5" cy="6.5" r="4.6" fill="#0d1520" stroke="#c8ff2e" stroke-width="1.2"/><path d="M15.6 6.6l1.3 1.3 2.4-2.6" fill="none" stroke="#c8ff2e" stroke-width="1.4" stroke-linecap="round"/></svg>','Ya jugó','en este turno actúa otra ficha']
 ];
 function card(parent,cls,title,icon){
  const s=el('section','fu97-card '+cls,parent);
  if(title){const h=el('h2','fu97-card-title',s);h.innerHTML=(icon||'')+'<span>'+escapeText(title)+'</span>';}
  return s;
 }
 function buildLayout(){
  const head=appEl.querySelector('.head');
  const sbBlock=head&&head.querySelector('.scoreboard-block');
  const sbLine=sbBlock&&sbBlock.querySelector('.scoreboard-line');
  const sbScore=sbLine&&sbLine.querySelector('.scoreboard-score');
  const clock=$('matchClock'),s1El=$('s1'),s2El=$('s2');
  if(!head||!sbBlock||!sbLine||!sbScore||!clock||!s1El||!s2El)throw new Error('marcador no reconocido');
  const nav=appEl.querySelector('.fu-home-nav');
  const duration=appEl.querySelector('.match-duration-control');
  const turnLine=$('turn'),narrative=$('matchNarrative'),controls=appEl.querySelector('.controls');
  const altKit=$('alternateKitPanel'),bottom=appEl.querySelector('.bottom'),msgEl=$('msg'),cpuEl=$('cpuStatus');
  const resultPanel=$('tournamentResultPanel'),hint=appEl.querySelector('.mobile-pitch-hint');
  const fab=$('ballModeControl'),fsBtn=$('pitchFullscreenControl');
  head.classList.add('fu97-topbar');
  // Navegación compacta.
  if(nav){
   head.insertBefore(nav,head.firstChild);
   nav.classList.add('fu97-nav');
   const a=nav.querySelector('a');
   if(a){
    const text=Array.from(a.childNodes).filter(n=>n.nodeType===3).map(n=>{const t=n.textContent;n.remove();return t;}).join(' ').replace(/\s+/g,' ').trim();
    const arrow=a.querySelector('.fu-arrow');
    if(arrow)arrow.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const label=el('span','fu97-nav-label',a,text||'Volver');
    a.title=label.textContent;a.setAttribute('aria-label',label.textContent);
   }
  }
  // Marcador tipo transmisión: [camiseta · equipo] [goles] [equipo · camiseta].
  const names=Array.from(sbScore.children).filter(n=>n.tagName==='B');
  Array.from(sbScore.childNodes).forEach(n=>{if(n.nodeType===3)n.remove();});
  const home=el('div','fu97-sb-team fu97-home'),away=el('div','fu97-sb-team fu97-away'),result=el('div','fu97-sb-result');
  ui.chip1=el('span','fu97-kitchip');ui.chip2=el('span','fu97-kitchip');
  home.appendChild(ui.chip1);if(names[0])home.appendChild(names[0]);
  if(names[1])away.appendChild(names[1]);away.appendChild(ui.chip2);
  result.appendChild(s1El);el('span','fu97-sb-sep',result,'–');result.appendChild(s2El);
  sbScore.append(home,result,away);
  ui.result=result;
  // Nombre completo en pantallas anchas y sigla en celulares (club en Torneo, «EQ 1/EQ 2» en Práctica).
  const clubs=tournamentMode&&tournamentClub&&tournamentOpponent?[tournamentClub,tournamentOpponent]:[null,null];
  [names[0],names[1]].forEach((b,i)=>{
   if(!b)return;
   const texts=Array.from(b.childNodes).filter(n=>n.nodeType===3);
   const club=clubs[i],fullText=texts.map(n=>n.textContent).join('').trim()||(club?club.name:'Equipo '+(i+1));
   texts.forEach(n=>n.remove());
   el('span','fu97-name-full',b,fullText);
   el('span','fu97-name-short',b,club&&club.short?club.short:'EQ '+(i+1));
   b.title=fullText;
  });
  sbScore.classList.add('fu97-scorebug');
  ui.scorebug=sbScore;
  // Insignia de turno con las tres acciones.
  const turnBox=el('div','fu97-turnbox');
  turnBox.setAttribute('role','status');turnBox.setAttribute('aria-live','polite');
  ui.badge=el('span','fu97-turn-badge',turnBox,'TU TURNO');
  ui.pips=el('span','fu97-pips',turnBox);ui.pips.setAttribute('aria-hidden','true');
  for(let i=0;i<ACTIONS;i++)el('i',null,ui.pips);
  ui.turnSub=el('span','fu97-turn-sub',turnBox,'Acción 1/'+ACTIONS);
  sbLine.appendChild(turnBox);
  ui.turnBox=turnBox;
  const tools=el('div','fu97-ab-tools',sbLine);
  ui.viewBtn=el('button','fu97-tool fu97-viewtoggle',tools);ui.viewBtn.type='button';
  ui.viewBtn.addEventListener('click',()=>{setZoomPref(!zoomPref);});
  if(fsBtn){tools.appendChild(fsBtn);fsBtn.classList.add('fu97-tool');fsBtn.innerHTML='<span class="fs-icon" aria-hidden="true">'+ICONS.expand+'</span>';ui.fsBtn=fsBtn;}
  // Cuerpo: columna de cancha + panel lateral.
  const main=el('div','fu97-main');
  const col=el('div','fu97-pitchcol',main);
  const side=el('aside','fu97-side',main);side.setAttribute('aria-label','Panel del partido');
  appEl.insertBefore(main,boardEl);
  col.appendChild(boardEl);
  if(hint)col.appendChild(hint);
  if(resultPanel)col.appendChild(resultPanel);
  // Marco de la cancha: aloja la repetición y los avisos sin tocar el SVG.
  const frame=el('div','fu97-pitchframe');
  boardEl.insertBefore(frame,scrollEl);
  frame.appendChild(scrollEl);
  const tag=el('div','fu97-replay-tag',frame);tag.setAttribute('aria-hidden','true');
  tag.innerHTML='<i></i><span>REPETICIÓN</span>';
  // Cartel tipo transmisión para reanudaciones y jugadas (el texto completo sigue en el relato).
  ui.banner=el('div','fu97-banner',frame);ui.banner.setAttribute('aria-hidden','true');
  ui.bannerTitle=el('b',null,ui.banner);ui.bannerSub=el('span',null,ui.banner);
  ui.bannerS1=el('em',null,ui.bannerSub);ui.bannerS2=el('em','fu97-banner-more',ui.bannerSub);
  ui.frame=frame;
  // Barra de acción (dentro del tablero para que también se vea en pantalla completa).
  const bar=el('div','fu97-actionbar');bar.setAttribute('role','group');bar.setAttribute('aria-label','Jugada en curso');
  const chip=el('div','fu97-ab-player',bar);
  ui.chipToken=el('span','fu97-ab-token',chip);
  const chipText=el('span','fu97-ab-text',chip);
  ui.chipName=el('strong',null,chipText,'Elegí una ficha');
  ui.chipSub=el('small',null,chipText,'');
  const msgWrap=el('div','fu97-ab-msg',bar);
  if(msgEl)msgWrap.appendChild(msgEl);
  ui.msgWrap=msgWrap;
  ui.more=el('button','fu97-msg-more',msgWrap,'Ver más');ui.more.type='button';ui.more.hidden=true;
  ui.more.addEventListener('click',()=>{const open=!msgWrap.classList.contains('is-open');msgWrap.classList.toggle('is-open',open);ui.more.textContent=open?'Ver menos':'Ver más';});
  if(fab)bar.appendChild(fab);
  boardEl.insertBefore(bar,frame.nextSibling);
  ui.bar=bar;
  // Panel lateral.
  const status=card(side,'fu97-card-status','Jugada',ICONS.status);
  if(turnLine)status.appendChild(turnLine);
  const stateEl=$('state');if(stateEl)status.appendChild(stateEl);
  if(cpuEl)status.appendChild(cpuEl);
  const legend=card(side,'fu97-card-legend is-collapsed','Cómo leer la cancha',ICONS.legend);
  const ul=el('ul','fu97-legend',legend);
  // La guía es de consulta: queda plegada y se abre desde su título (clic, Enter o espacio).
  const lt=legend.querySelector('.fu97-card-title');
  if(lt){
   lt.setAttribute('role','button');lt.tabIndex=0;lt.setAttribute('aria-expanded','false');
   const toggleLegend=()=>{const open=legend.classList.toggle('is-collapsed')===false;lt.setAttribute('aria-expanded',String(open));scheduleSize();};
   lt.addEventListener('click',toggleLegend);
   lt.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleLegend();}});
  }
  LEGEND.forEach(item=>{const li=el('li',null,ul);li.innerHTML=item[0]+'<span><b>'+escapeText(item[1])+'</b><small>'+escapeText(item[2])+'</small></span>';});
  if(narrative){const story=card(side,'fu97-card-story',null);story.appendChild(narrative);}
  const matchCard=card(side,'fu97-card-match','Partido',ICONS.match);
  if(controls)matchCard.appendChild(controls);
  if(duration)matchCard.appendChild(duration);
  const kits=el('details','fu97-card fu97-kits',side);
  const summary=el('summary','fu97-card-title',kits);
  summary.innerHTML=ICONS.kit+'<span>Camisetas</span>';
  ui.kitPreview=el('span','fu97-kits-preview',summary);
  const kitBody=el('div','fu97-kits-body',kits);
  if(controls)controls.querySelectorAll('label.ctrl').forEach(l=>kitBody.appendChild(l));
  const studio=$('fuPracticeKitStudio');if(studio)kitBody.appendChild(studio);
  if(altKit)kitBody.appendChild(altKit);
  if(!kitBody.children.length)kits.hidden=true;
  if(bottom){bottom.classList.add('fu97-foot');side.appendChild(bottom);}
  // Observadores: textos del motor -> marcador, insignias y barra de acción.
  const watch=(node,fn,opts)=>{if(node)fuObserve(new MutationObserver(fn),node,opts||{childList:true,characterData:true,subtree:true});};
  watch(turnLine,syncHud);
  watch($('matchClockState'),syncHud);
  watch(cpuEl,syncHud,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['class']});
  [s1El,s2El].forEach(n=>watch(n,()=>bump(n)));
  watch(msgEl,onMessage);
  ['goalCelebrationOverlay','halftimeOverlay','finalMatchOverlay','foulNotice'].forEach(id=>{const n=$(id);if(n)fuObserve(new MutationObserver(()=>onOverlay(n)),n,{attributes:true,attributeFilter:['hidden']});});
  fuListen(scrollEl,'scroll',()=>{if(vertical&&scrollEl.scrollLeft)scrollEl.scrollLeft=0;},{passive:true});
 }
 function bump(n){if(!n)return;n.classList.remove('fu97-bump');void n.offsetWidth;n.classList.add('fu97-bump');setTimeout(()=>n.classList.remove('fu97-bump'),900);}
 // Mensajes de acción rechazada (el motor no consumió la acción) y avisos de eventos del partido.
 const WARN=/^(Saque inicial obligatorio|Tiro libre obligatorio|Pase bloqueado|Pase\/remate bloqueado|Movimiento bloqueado|Cada acción del turno|Ahora juega el Equipo|Ese movimiento no es válido|Ese destino supera|Esa casilla está ocupada|El arquero bloquea|El arquero tiene la posesión|La disputa|En un saque de banda|Primero debe ejecutarse|El saque inicial debe|El jugador seleccionado debe|Seleccioná al jugador|No existe una casilla|No hay espacio libre|Partido finalizado)/;
 const EVENT=/^(¡FALTA|FALTA SANCIONADA|Falta rápida|Gol confirmado|FINAL DEL PARTIDO|Final del primer tiempo|Comienza el segundo tiempo|¡Remate|¡Desvío|¡Atajada|SAQUE|LATERAL|TIRO LIBRE)/i;
 let lastMsg='';
 // Cartel de jugada: sólo reanudaciones, desvíos y comienzos de período. Faltas, goles y remates ya tienen su aviso propio.
 const RESTART=/^(SAQUE[A-ZÁÉÍÓÚÑ ]*|LATERAL|TIRO LIBRE[A-ZÁÉÍÓÚÑ ]*|CÓRNER|TIRO DE ESQUINA)\s*:\s*(.*)$/;
 let bannerTimer=0;
 function bannerFor(text){
  const m=RESTART.exec(text);
  if(m)return {title:m[1].trim(),sub:m[2],kind:'restart'};
  if(/^¡Desvío!/.test(text))return {title:'¡DESVÍO!',sub:text.replace(/^¡Desvío!\s*/,''),kind:'event'};
  if(/^Comienza el segundo tiempo/.test(text))return {title:'SEGUNDO TIEMPO',sub:'',kind:'period'};
  if(/^¡Comienza el partido!/.test(text))return {title:'¡COMIENZA EL PARTIDO!',sub:text.replace(/^¡Comienza el partido!\s*/,''),kind:'period'};
  return null;
 }
 function showBanner(text){
  if(!ui.banner||!stateIsLive())return;
  const b=bannerFor(text);if(!b)return;
  ui.bannerTitle.textContent=b.title;
  const parts=b.sub.split('. ').map(x=>x.replace(/[.\s]+$/,'')).filter(Boolean);
  ui.bannerS1.textContent=parts[0]||'';ui.bannerS2.textContent=parts[1]?' · '+parts[1]:'';
  ui.bannerSub.hidden=!parts.length;
  ui.banner.dataset.kind=b.kind;
  ui.banner.classList.remove('is-on');void ui.banner.offsetWidth;ui.banner.classList.add('is-on');
  clearTimeout(bannerTimer);bannerTimer=setTimeout(()=>ui.banner.classList.remove('is-on'),2600);
 }
 function onMessage(){
  const m=$('msg');if(!m||!ui.msgWrap)return;
  const text=m.textContent||'';
  if(text===lastMsg)return;
  lastMsg=text;
  ui.msgWrap.classList.remove('is-open');ui.more.textContent='Ver más';
  ui.msgWrap.classList.toggle('is-warn',WARN.test(text));
  ui.msgWrap.classList.toggle('is-event',!WARN.test(text)&&EVENT.test(text));
  ui.msgWrap.classList.remove('is-flash');void ui.msgWrap.offsetWidth;ui.msgWrap.classList.add('is-flash');
  showBanner(text);
  requestAnimationFrame(fitMsgMore);
 }
 function onOverlay(n){
  if(n.id==='goalCelebrationOverlay'){
   n.querySelectorAll('.fu97-confetti').forEach(c=>c.remove());
   if(!n.hidden&&!reducedMotion()){
    const team=+n.getAttribute('data-team')||1,k=kit(team),palette=[k.primary,k.secondary,k.accent,'#c8ff2e','#ffffff'];
    const box=el('div','fu97-confetti',n);box.setAttribute('aria-hidden','true');
    for(let i=0;i<42;i++){
     const c=el('i',null,box);
     c.style.left=(fxRandom()*100).toFixed(1)+'%';
     c.style.background=palette[i%palette.length];
     c.style.animationDelay=Math.round(fxRandom()*500)+'ms';
     c.style.animationDuration=Math.round(1700+fxRandom()*1300)+'ms';
     c.style.setProperty('--fu97-drift',Math.round(fxRandom()*140-70)+'px');
     c.style.setProperty('--fu97-rot',Math.round(fxRandom()*720-360)+'deg');
    }
   }
  }
  syncHud();
 }
 let kitKey='';
 function syncKits(){
  const key=[1,2].map(t=>{const k=kit(t);return k.primary+k.secondary+k.accent+k.number+k.pattern;}).join('|');
  if(key===kitKey)return;
  kitKey=key;
  if(ui.chip1)ui.chip1.innerHTML=shirtSvg(1,'fu97ShirtA');
  if(ui.chip2)ui.chip2.innerHTML=shirtSvg(2,'fu97ShirtB');
  if(ui.kitPreview)ui.kitPreview.innerHTML=shirtSvg(1,'fu97ShirtC')+shirtSvg(2,'fu97ShirtD');
  const k1=kit(1),k2=kit(2);
  // Camisetas muy claras (p. ej. blancas): el tono del marcador usa el color secundario para conservar contraste.
  const tone=k=>luminance(k.primary)>.6?(luminance(k.secondary)<.45?k.secondary:'#6c7a90'):k.primary;
  if(ui.scorebug){
   const t1=tone(k1),t2=tone(k2);
   ui.scorebug.style.setProperty('--fu97-c1',t1);ui.scorebug.style.setProperty('--fu97-c2',t2);
   ui.scorebug.style.setProperty('--fu97-c1s',rgba(t1,.34));ui.scorebug.style.setProperty('--fu97-c2s',rgba(t2,.34));
  }
  chipKey='';
  syncHud();
 }
 let chipKey='';
 function syncHud(){
  if(!ui.badge)return;
  const setBadge=(text,cls)=>{ui.badge.textContent=text;ui.turnBox.className='fu97-turnbox '+cls;};
  if(cpuSearching){setBadge('CPU PENSANDO','is-cpu is-thinking');return;}
  if(!stateIsLive())return;
  const cpuTurn=turn===CPU_TEAM&&cpuAutoEnabled;
  if(matchClockFinished)setBadge('FINAL','is-final');
  else if(goalCelebrationActive)setBadge('¡GOL!','is-goal');
  else if(halftimePaused)setBadge('DESCANSO','is-break');
  else if(cpuTurn)setBadge(anim?'JUEGA LA CPU':'TURNO CPU','is-cpu');
  else if(turn===HUMAN_TEAM)setBadge(anim?'EN JUEGO':'TU TURNO','is-you');
  else setBadge('EQUIPO 2 · MANUAL','is-manual');
  Array.from(ui.pips.children).forEach((pip,i)=>{
   pip.className=matchClockFinished?'':i<actionNo-1?'is-done':i===actionNo-1?'is-now':'';
  });
  ui.turnBox.dataset.team=String(turn);
  if(matchClockFinished)setTurnSub('Partido terminado','');else setTurnSub('Acción '+actionNo+'/'+ACTIONS+' · '+teamName(turn),'Acción '+actionNo+'/'+ACTIONS);
  ui.pips.parentNode.setAttribute('aria-label',ui.badge.textContent+' · acción '+actionNo+' de '+ACTIONS);
  // Ficha elegida y modo.
  const x=selected!==null?p.find(z=>z.id===selected):null;
  const o=owner();
  // Barra de posesión bajo el resultado: del lado del equipo que tiene la pelota.
  if(ui.result)ui.result.dataset.poss=o&&!matchClockFinished?String(o.t):'0';
  let name,sub,key;
  if(x&&!matchClockFinished){
   const cpu=x.t===CPU_TEAM&&cpuAutoEnabled;
   name=(cpu?'CPU · ':'')+'Jugador '+x.n;
   if(cpu)sub=anim?'Ejecuta la jugada':'Prepara la jugada';
   else if(o&&o.id===x.id)sub=mode==='ball'?'Elegí destino: pase o remate':'Con balón · mover o PASE/TIRO';
   else sub='Elegí una casilla para moverlo';
   const k=kit(x.t);key=x.t+':'+x.n+':'+k.primary+k.secondary+k.accent+k.number+k.pattern;
  }else{
   name=matchClockFinished?'Partido finalizado':turn===HUMAN_TEAM||!cpuAutoEnabled?'Elegí una ficha':'Turno rival';
   sub=matchClockFinished?'Revisá el resultado o empezá otro':turn===HUMAN_TEAM||!cpuAutoEnabled?'Tocá un jugador de tu equipo':'Mirá la jugada de la CPU';
   key='none';
  }
  ui.chipName.textContent=name;setChipSub(sub);
  if(key!==chipKey){chipKey=key;ui.chipToken.innerHTML=x&&!matchClockFinished?miniTokenSvg(x,'fu97ChipClip'):'<svg viewBox="-36 -36 72 72" aria-hidden="true"><circle r="30" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="7 6"/><circle r="5" fill="currentColor"/></svg>';}
  boardEl.classList.toggle('fu97-mode-ball',mode==='ball'&&!!x&&!!o&&o.id===x.id);
  boardEl.classList.toggle('fu97-cpu-turn',cpuTurn);
  boardEl.classList.toggle('fu97-anim',!!anim);
  boardEl.classList.toggle('fu97-finished',!!matchClockFinished);
  const clockState=$('matchClockState');
  if(clockState){const c=$('matchClock');if(c){c.classList.toggle('fu97-clock-break',!!halftimePaused);c.classList.toggle('fu97-clock-final',!!matchClockFinished);}}
  if(chipSubDirty){chipSubDirty=false;fitChipSub();requestAnimationFrame(fitChipSub);}
  if(turnSubDirty){turnSubDirty=false;fitTurnSub();}
 }

 // ---------------------------------------------------------------- orientación y tamaño
 const VIEW_KEY='futbolUnico_v97_vista_movil';
 let zoomPref=false;
 try{zoomPref=localStorage.getItem(VIEW_KEY)==='ampliada';}catch(e){zoomPref=false;}
 function setZoomPref(v){
  zoomPref=!!v;
  try{localStorage.setItem(VIEW_KEY,zoomPref?'ampliada':'completa');}catch(e){}
  applyOrientation();
 }
 function isFullscreen(){return document.fullscreenElement===boardEl||document.webkitFullscreenElement===boardEl;}
 function applyOrientation(){
  const portrait=!!portraitMQ.matches;
  const next=portrait&&!zoomPref;
  const changed=next!==vertical;
  vertical=next;
  boardEl.classList.toggle('fu97-vertical',vertical);
  boardEl.classList.toggle('fu97-zoom',portrait&&zoomPref);
  appEl.classList.toggle('fu97-mobile-complete',vertical);
  rootEl.classList.toggle('fu97-portrait',portrait);
  if(ui.viewBtn){
   ui.viewBtn.hidden=!portrait;
   ui.viewBtn.innerHTML=(zoomPref?ICONS.pitch:ICONS.zoom)+'<span>'+(zoomPref?'Completa':'Ampliar')+'</span>';
   ui.viewBtn.setAttribute('aria-label',zoomPref?'Ver la cancha completa en vertical':'Ampliar la cancha y desplazarla horizontalmente');
   ui.viewBtn.title=ui.viewBtn.getAttribute('aria-label');
   ui.viewBtn.setAttribute('aria-pressed',String(zoomPref));
  }
  if(changed){refreshUprights();if(stateIsLive()&&!anim)newDrawBall();else pendingBallRedraw=true;}
  if(vertical)scrollEl.scrollLeft=0;
  else requestAnimationFrame(()=>requestAnimationFrame(()=>{if(!layerFailed&&stateIsLive())followBallOnMobile();}));
  sizeBoard();
 }
 // Chip de la barra de acción: texto completo si entra en una línea; si no, una versión corta (nunca cortado con «…»).
 const CHIP_SUB_SHORT={'Con balón · mover o PASE/TIRO':'Mové, pasá o tirá','Elegí destino: pase o remate':'Elegí pase o remate','Elegí una casilla para moverlo':'Elegí una casilla','Tocá un jugador de tu equipo':'Tocá una ficha tuya','Revisá el resultado o empezá otro':'Revisá el resultado','Mirá la jugada de la CPU':'Juega la CPU'};
 let chipSubFull=null,chipSubDirty=false;
 // Sólo registra el texto: se mide al final de syncHud, cuando ya cambiaron las clases que alteran el ancho del botón.
 function setChipSub(text){if(text===chipSubFull)return;chipSubFull=text;chipSubDirty=true;}
 function fitChipSub(){
  if(layerFailed)return;
  const s=ui.chipSub;if(!s||chipSubFull===null)return;
  s.textContent=chipSubFull;s.removeAttribute('title');
  const short=CHIP_SUB_SHORT[chipSubFull];
  const have=short?s.getBoundingClientRect().width:0;if(!have)return;
  // Ancho real con decimales: scrollWidth/clientWidth redondean y el navegador corta con «…» aunque sobre medio píxel.
  const range=document.createRange();range.selectNodeContents(s);
  if(range.getBoundingClientRect().width>have+0.02){s.textContent=short;s.title=chipSubFull;}
 }
 // ¿El contenido real (con decimales) es más ancho que la caja? scrollWidth redondea y el navegador corta igual con «…».
 function textOverflows(e){
  if(!e||!e.getClientRects().length)return false;
  const have=e.getBoundingClientRect().width;if(!have)return false;
  const range=document.createRange();range.selectNodeContents(e);
  return range.getBoundingClientRect().width>have+0.02;
 }
 // Marcador: nombres completos si entran los dos; en Torneo, después sin camiseta; si no, siglas en ambos (nunca mezclado).
 function fitTeamNames(){
  const sb=ui.scorebug;if(!sb)return;
  // Se mide cada nombre por separado: medido sobre la etiqueta entera, Chrome devuelve el texto ya recortado por el «…» interno.
  const parts=Array.from(sb.querySelectorAll('.fu97-sb-team > b, .fu97-sb-team .fu97-name-full, .fu97-sb-team .fu97-name-short'));
  const cut=e=>!!e.getClientRects().length&&(e.scrollWidth>e.clientWidth||textOverflows(e));
  const overflow=()=>parts.some(cut);
  sb.classList.remove('fu97-nochip','fu97-codes');
  if(!overflow())return;
  if(tournamentMode){sb.classList.add('fu97-nochip');if(!overflow())return;}
  sb.classList.add('fu97-codes');
 }
 // Subtítulo del turno: «Acción 1/3 · Equipo», «Acción 1/3» o nada si no hay lugar.
 let turnSubFull=null,turnSubShort='',turnSubDirty=false;
 function setTurnSub(full,short){if(full===turnSubFull)return;turnSubFull=full;turnSubShort=short;turnSubDirty=true;}
 function fitTurnSub(){
  const s=ui.turnSub;if(!s||turnSubFull===null)return;
  s.classList.remove('fu97-off');s.textContent=turnSubFull;
  if(!s.getClientRects().length)return;
  if(turnSubShort&&textOverflows(s))s.textContent=turnSubShort;
  if(textOverflows(s)||s.getBoundingClientRect().width<24)s.classList.add('fu97-off');
 }
 // «Ver más» sólo cuando el relato no entra; se recalcula también al cambiar el tamaño.
 function fitMsgMore(){
  if(layerFailed)return;
  const m=$('msg');if(!m||!ui.more||!ui.msgWrap||ui.msgWrap.classList.contains('is-open'))return;
  ui.more.hidden=!(m.scrollHeight>m.clientHeight+2);
 }
 function fitTexts(){if(layerFailed)return;fitTeamNames();fitTurnSub();fitChipSub();fitMsgMore();}
 function sizeBoard(){
  if(layerFailed)return;
  const fs=isFullscreen();
  if(ui.fsBtn)ui.fsBtn.innerHTML='<span class="fs-icon" aria-hidden="true">'+(fs?ICONS.collapse:ICONS.expand)+'</span>';
  if(fs){boardEl.style.removeProperty('--fu97-board-w');requestAnimationFrame(()=>{if(layerFailed)return;const cw=scrollEl.clientWidth;if(cw)scrollEl.style.setProperty('--fu97-cw',cw+'px');fitTexts();});return;}
  const col=boardEl.parentElement;if(!col)return;
  const colW=col.clientWidth;if(!colW)return;
  const head=appEl.querySelector('.head');
  const cs=getComputedStyle(document.body);
  const padY=(parseFloat(cs.paddingTop)||0)+(parseFloat(cs.paddingBottom)||0);
  const sideBySide=getComputedStyle(appEl).getPropertyValue('--fu97-head-side').trim()==='1';
  const headH=head&&!sideBySide?head.getBoundingClientRect().height+10:0;
  const barH=ui.bar?ui.bar.getBoundingClientRect().height:0;
  const bcs=getComputedStyle(boardEl);
  const chromeY=(parseFloat(bcs.paddingTop)||0)+(parseFloat(bcs.paddingBottom)||0)+(parseFloat(bcs.borderTopWidth)||0)*2+(parseFloat(bcs.rowGap)||0);
  const chromeX=(parseFloat(bcs.paddingLeft)||0)+(parseFloat(bcs.paddingRight)||0)+(parseFloat(bcs.borderLeftWidth)||0)*2;
  const availH=window.innerHeight-padY-headH-barH-chromeY-4;
  const ratio=vertical?VB.h/VB.w:VB.w/VB.h;
  const fitW=Math.floor(availH*ratio+chromeX);
  let w;
  if(vertical){
   // Celular vertical («Completa»): la cancha entra en pantalla; como mucho ~18px (la red, fuera de la línea de gol) quedan bajo la barra fija.
   w=Math.max(fitW,Math.min(Math.floor(colW*.86),fitW+Math.round(18*ratio)));
   w=Math.min(colW,Math.max(w,Math.min(colW,236)));
  }else w=Math.max(Math.min(colW,320),Math.min(colW,fitW));
  boardEl.style.setProperty('--fu97-board-w',w+'px');
  const cw=scrollEl.clientWidth;if(cw)scrollEl.style.setProperty('--fu97-cw',cw+'px');
  fitTexts();
 }
 let sizeRaf=0;
 function scheduleSize(){if(layerFailed)return;cancelAnimationFrame(sizeRaf);sizeRaf=requestAnimationFrame(()=>{if(!layerFailed)applyOrientation();});}

 // ---------------------------------------------------------------- instalación transaccional
 // La capa se instala como una transacción. Antes de tocar nada se toma una foto del documento (nodos, orden de
 // los hijos, atributos y textos) y cada escucha, observador o temporizador que v97 pone sobre objetos que no crea
 // queda anotado en fuUndo. Si un paso falla, se deshace todo, se reponen los renderizadores y el motor redibuja
 // la vista v96: no quedan paneles movidos, SVG modificado ni escuchas colgando.
 let layerFailed=false,fuSnap=null;
 const fuUndo=[];
 function fuListen(target,type,fn,opts){if(!target)return;target.addEventListener(type,fn,opts);fuUndo.push(()=>target.removeEventListener(type,fn,opts));}
 function fuObserve(obs,node,opts){obs.observe(node,opts);fuUndo.push(()=>obs.disconnect());return obs;}
 function fuTimeout(fn,ms){const id=setTimeout(fn,ms);fuUndo.push(()=>clearTimeout(id));}
 function fuSnapshot(root){
  const items=[],walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT|NodeFilter.SHOW_COMMENT);
  for(let n=root;n;n=walker.nextNode()){
   if(n.nodeType===1)items.push({n,kids:Array.prototype.slice.call(n.childNodes),attrs:Array.prototype.map.call(n.attributes,a=>[a.namespaceURI,a.name,a.value])});
   else items.push({n,data:n.data});
  }
  return items;
 }
 function fuRollback(items){
  const changed=items.filter(it=>{
   if(!it.kids)return false;
   const cur=it.n.childNodes;
   if(cur.length!==it.kids.length)return true;
   for(let i=0;i<cur.length;i++)if(cur[i]!==it.kids[i])return true;
   return false;
  });
  // 1) Se vacían los contenedores alterados: los nodos nuevos salen del documento y los movidos quedan sueltos.
  changed.forEach(it=>{const n=it.n;while(n.lastChild)n.removeChild(n.lastChild);});
  // 2) Cada contenedor recupera sus hijos originales, en el orden original: son los mismos nodos, con las escuchas del motor.
  changed.forEach(it=>{it.kids.forEach(k=>{try{it.n.appendChild(k);}catch(e){console.error('[Fútbol Único v97] No se pudo reponer un nodo.',e);}});});
  // 3) Atributos y textos originales (class, style, viewBox, transform, xlink:href, hidden, data-*...).
  //    Si un elemento cambió en algo, se le reponen todos sus atributos en el orden original.
  items.forEach(it=>{
   const n=it.n;
   if(!it.attrs){if(n.data!==it.data)n.data=it.data;return;}
   const cur=n.attributes;
   let same=cur.length===it.attrs.length;
   for(let i=0;same&&i<cur.length;i++){const a=cur[i],o=it.attrs[i];same=a.namespaceURI===o[0]&&a.name===o[1]&&a.value===o[2];}
   if(same)return;
   while(n.attributes.length)n.removeAttributeNode(n.attributes[0]);
   it.attrs.forEach(a=>{if(a[0])n.setAttributeNS(a[0],a[1],a[2]);else n.setAttribute(a[1],a[2]);});
  });
 }
 // ---------------------------------------------------------------- instalación
 const previous={animatePlayerMove,animateDuel,animateBall,drawPlayers,drawBall,rebuildBallTargets,refresh};
 function installRenderers(){
  animatePlayerMove=newAnimatePlayerMove;
  animateDuel=newAnimateDuel;
  animateBall=newAnimateBall;
  drawPlayers=newDrawPlayers;
  drawBall=newDrawBall;
  rebuildBallTargets=newRebuildBallTargets;
  const baseRefresh=previous.refresh;
  refresh=function(){
   const value=baseRefresh.apply(this,arguments);
   const act=stateIsLive()?active():null,attack=act?(act.t===1?'R':'L'):null;
   gL.classList.toggle('fu97-target',gL.classList.contains('active')&&attack==='L');
   gR.classList.toggle('fu97-target',gR.classList.contains('active')&&attack==='R');
   decorateTokens();
   if(pendingBallRedraw&&stateIsLive()&&!anim)newDrawBall();
   syncHud();
   return value;
  };
 }
 function restoreRenderers(){
  animatePlayerMove=previous.animatePlayerMove;animateDuel=previous.animateDuel;animateBall=previous.animateBall;
  drawPlayers=previous.drawPlayers;drawBall=previous.drawBall;rebuildBallTargets=previous.rebuildBallTargets;refresh=previous.refresh;
 }
 try{
  fuSnap=fuSnapshot(document.documentElement);
  installDefs();
  buildPitch();
  buildLayers();
  buildBall();
  buildLayout();
  hookPreview();
  installRenderers();
  rootEl.classList.add('fu97');
  appEl.classList.add('fu97-app');
  applyOrientation();
  drawPlayers();drawBall();refresh();
  onMessage();
  // Las mediciones de texto dependen de la tipografía: se repiten cuando terminan de cargar las fuentes.
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{if(rootEl.classList.contains('fu97'))fitTexts();});
  const onViewport=()=>scheduleSize();
  fuListen(window,'resize',onViewport,{passive:true});
  fuListen(window,'orientationchange',onViewport,{passive:true});
  if(portraitMQ.addEventListener)fuListen(portraitMQ,'change',onViewport);
  fuListen(document,'fullscreenchange',()=>setTimeout(scheduleSize,60));
  fuListen(document,'webkitfullscreenchange',()=>setTimeout(scheduleSize,60));
  if(window.ResizeObserver){const ro=fuObserve(new ResizeObserver(()=>scheduleSize()),appEl);if(ui.bar)ro.observe(ui.bar);}
  fuTimeout(scheduleSize,120);
  window.FUTBOL_UNICO_V97={
   version:VERSION,
   layer:'visual',
   isVertical:()=>vertical,
   setMobileView:v=>setZoomPref(v==='ampliada'),
   redraw:()=>{if(stateIsLive()&&!anim){drawPlayers();drawBall();refresh();}}
  };
  fuSnap=null;
 }catch(error){
  console.error('[Fútbol Único v97] No se pudo instalar el rediseño visual; se restaura la vista v96.',error);
  layerFailed=true;
  // Orden: primero se cortan escuchas y observadores (para que la restauración no dispare código v97),
  // después se reponen los renderizadores y el documento, y al final el motor redibuja con sus funciones.
  for(let i=fuUndo.length-1;i>=0;i--){try{fuUndo[i]();}catch(e){}}
  fuUndo.length=0;
  cancelAnimationFrame(sizeRaf);
  restoreRenderers();
  if(fuSnap){try{fuRollback(fuSnap);}catch(e){console.error('[Fútbol Único v97] Falló la restauración del documento.',e);}}
  fuSnap=null;
  rootEl.classList.remove('fu97');
  try{delete window.FUTBOL_UNICO_V97;}catch(e){}
  try{drawPlayers();drawBall();refresh();}catch(e){console.error('[Fútbol Único v97] Error al redibujar la vista v96.',e);}
 }
})();
// ================== FIN FÚTBOL ÚNICO v97 ==================
`;

// v98 · Correcciones del motor. Capa separada de v96 (táctica) y de v97 (visual): sólo corrige estados
// imposibles del balón. No cambia reglas, probabilidades, resolución de acciones, IA ni cronómetro.
const V98_ENGINE_FIXES = String.raw`
 // ==================== FÚTBOL ÚNICO v98 · CORRECCIONES DEL MOTOR ====================
 // Pase fallido que no sale de la casilla del pasador.
 // En v96, un pase que queda corto tantas casillas como su distancia termina en la casilla de origen,
 // y el pasador no puede recibir su propio pase fallido. Sin esta corrección la pelota quedaba suelta
 // (owner=null) debajo del pasador: en una casilla ocupada a la que nadie puede entrar, de modo que el
 // rival no podía recogerla ni disputarla y sólo el equipo que falló podía destrabarla moviendo al pasador.
 // Una pelota suelta tiene que estar en una casilla libre para que rija la regla de recuperación
 // ("la ficha que entra en la casilla de una pelota suelta la recoge"), igual que tras un desvío o una disputa.
 // La pelota queda suelta en la casilla libre más cercana al pasador, en el sentido del pase, sin usar el
 // destino elegido ni casillas de gol. Es determinista: no consume azar, así que la precisión, los desvíos y
 // las intercepciones conservan exactamente sus probabilidades.
 function fuV98ShortPassRestCell(passer,from,intended){
  if(!passer||!from)return null;
  const target=intended&&Number.isFinite(intended.c)&&Number.isFinite(intended.r)?intended:null;
  const forward=attackDir(passer.t);
  const vx=target?target.c-from.c:forward,vy=target?target.r-from.r:0,vn=Math.hypot(vx,vy)||1;
  for(let radius=1;radius<Math.max(C,R);radius++){
   let best=null,bestKey=null;
   for(let r=from.r-radius;r<=from.r+radius;r++)for(let c=from.c-radius;c<=from.c+radius;c++){
    if(Math.max(Math.abs(c-from.c),Math.abs(r-from.r))!==radius)continue;
    if(c<0||c>=C||r<0||r>=R||at(c,r))continue;
    if(isGoalCell(c,r,'L')||isGoalCell(c,r,'R'))continue;
    if(target&&c===target.c&&r===target.r)continue;
    const dx=c-from.c,dy=r-from.r;
    // Orden: más alineada con el pase; más cerca de la fila central; fila; hacia el arco rival.
    // Es simétrico entre equipos: la misma jugada espejada deja la pelota en la casilla espejada.
    const key=[-Math.round((dx*vx+dy*vy)/(Math.hypot(dx,dy)*vn)*1e6),Math.abs(2*r-(R-1)),r,-dx*forward];
    let better=!best;
    for(let i=0;!better&&i<key.length;i++){if(key[i]!==bestKey[i]){better=key[i]<bestKey[i];break;}}
    if(better){best={c,r};bestKey=key;}
   }
   if(best)return best;
  }
  return null;
 }
 // ================== FIN FÚTBOL ÚNICO v98 · CORRECCIONES DEL MOTOR ==================
`;

// v98 · Fase 1 de IA: coherencia de la simulación predictiva de la CPU con el motor real.
// Solo cambia la simulación con la que la CPU evalúa jugadas (simulateOneAction y sus reinicios).
// El partido real, sus reglas, probabilidades y cronómetro no cambian.
const V98_SIM_COHERENCE = String.raw`
 // ==================== FÚTBOL ÚNICO v98 · SIMULACIÓN COHERENTE ====================
 // Problemas corregidos (verificados con una prueba diferencial simulación ↔ motor real):
 //  1. Referencias huérfanas: la búsqueda genera las candidatas una vez por nodo y restaura el tablero
 //     con copias nuevas después de cada rama; desde la segunda candidata, la acción movía un objeto
 //     jugador que ya no estaba en el tablero y escribía la pelota con su id (pelota con dueño fuera de
 //     la casilla del dueño, movimientos sin efecto). Ahora la acción se aplica a la ficha viva por id.
 //  2. Disputa por atrás: findFreeCellNear(r,[x,r]) podía dejar la pelota suelta en la casilla del rival.
 //     Ahora se usa la misma elección que duel(): casilla siguiente o anillo libre ordenado por dirección.
 //  3. Pases y remates: el orden de resolución replica moveBall() (intercepción sobre la trayectoria
 //     desviada, validez de la casilla de gol, atajada antes del remate desviado afuera, gol de un pase
 //     desviado al arco, saque de arco como reinicio y limpieza del tiro libre ejecutado).
 //  4. La disputa comprueba que sea ejecutable antes de sortear la falta, igual que duel().
 // Cada rama consume las mismas tiradas, en el mismo orden, que el motor real (tacticalRandom).
 function fuV98BackDuelLooseCell(a,r,dc,dr){
  const preferred={c:r.c+dc,r:r.r+dr};
  if(preferred.c>=0&&preferred.c<C&&preferred.r>=0&&preferred.r<R&&!at(preferred.c,preferred.r,a.id)&&!at(preferred.c,preferred.r,r.id))return preferred;
  const choices=[];
  for(let rr=0;rr<R;rr++)for(let cc=0;cc<C;cc++){
   if(at(cc,rr,a.id)||at(cc,rr,r.id))continue;
   if(Math.max(Math.abs(cc-r.c),Math.abs(rr-r.r))!==1)continue;
   choices.push({c:cc,r:rr,score:(cc-r.c)*dc+(rr-r.r)*dr});
  }
  choices.sort((u,v)=>v.score-u.score);
  return choices[0]?{c:choices[0].c,r:choices[0].r}:null;
 }
 // goalTargets() con el ejecutante explícito (la versión visible usa la ficha seleccionada en pantalla).
 function fuV98GoalTargetsFor(x,side){
  const targetC=side==='L'?0:C-1;
  const gk=p.find(z=>z.t!==x.t&&z.n===1),out=[];
  for(let r=4;r<=6;r++){
   const dx=targetC-ball.c,dy=r-ball.r;
   if(!bLegalFor(targetC,r,x))continue;
   let blocked=false;const steps=Math.max(Math.abs(dx),Math.abs(dy));
   if(gk){for(let i=1;i<=steps;i++){const xx=ball.c+dx*i/steps,yy=ball.r+dy*i/steps;if(Math.hypot(gk.c-xx,gk.r-yy)<.46){blocked=true;break;}}}
   if(!blocked)out.push(r);
  }
  return out;
 }
 // Espejo de movePlayer(): mismas validaciones y consecuencias (conducir, recoger, disputar al poseedor).
 function fuV98SimMove(x,c,r){
  if(freeKickRequiredId!==null&&freeKickAwardedTeam===turn&&actionNo===1)return 'blocked';
  if(kickoffPassRequired)return 'blocked';
  if(ball.owner===x.id&&restartPassOnlyId===x.id)return 'blocked';
  if(isOffsideMove(c,x))return 'blocked';
  if(!pLegal(c,r,x))return 'blocked';
  const o=at(c,r,x.id);
  if(o){if(o.t!==x.t&&o.id===ball.owner)return fuV98SimDuel(x,o);return 'blocked';}
  const hadBall=ball.owner===x.id;
  x.c=c;x.r=r;
  if(hadBall)ball={c,r,owner:x.id};
  else if(ball.owner===null&&ball.c===c&&ball.r===r)ball={c,r,owner:x.id};
  return false;
 }
 // Espejo de duel(): primero se verifica que la maniobra sea ejecutable; después se sortea la falta.
 function fuV98SimDuel(a,r){
  if(freeKickRequiredId!==null&&freeKickAwardedTeam===turn&&actionNo===1)return 'blocked';
  if(r.n===1&&ball.owner===r.id)return 'blocked';
  const dc=r.c-a.c,dr=r.r-a.r;
  if(Math.abs(dc)>1||Math.abs(dr)>1||(!dc&&!dr))return 'blocked';
  const diagonal=Math.abs(dc)===1&&Math.abs(dr)===1;
  if(diagonal&&a.n!==5)return 'blocked';
  const tipo=diagonal?'costado':duelType(a,r);
  const resultado=tipo==='costado'&&[2,6].includes(a.n)?'frente':tipo;
  let q=null,loose=null;
  if(resultado==='frente'){q=findDisplacement(r,dc,dr,a.id);if(!q)return 'blocked';}
  else if(resultado==='costado'){q=findDisplacement(r,dc,dr,a.id);if(!q)return 'blocked';loose=findLooseBallCell(a,r,dc,dr,{c:r.c,r:r.r});if(!loose)return 'blocked';}
  else{q=findDisplacementFrom({c:a.c,r:a.r},-dc,-dr,a.id);if(!q)return 'blocked';loose=fuV98BackDuelLooseCell(a,r,dc,dr);if(!loose)return 'blocked';}
  const foulChance=tipo==='atras'?.60:tipo==='costado'?.30:0;
  if(foulChance>0&&tacticalRandom()<foulChance){
   // Mismas consecuencias que prepareFreeKick(): falta rápida para el equipo del jugador derribado.
   const spot={c:r.c,r:r.r},quick=createQuickFoulMoves(r.t,r,spot,a);
   for(const z of p){const t=quick.layout.get(z.id);if(t){z.c=t.c;z.r=t.r;}}
   r.c=spot.c;r.r=spot.r;ball={c:spot.c,r:spot.r,owner:r.id};
   turn=r.t;actionNo=1;lastPlayedId=null;playedThisTurn=[];restartPassOnlyId=null;
   freeKickRequiredId=r.id;freeKickAwardedTeam=r.t;
   return true;
  }
  if(resultado==='frente'){a.c=r.c;a.r=r.r;r.c=q.c;r.r=q.r;ball={c:a.c,r:a.r,owner:a.id};return false;}
  if(resultado==='costado'){a.c=r.c;a.r=r.r;r.c=q.c;r.r=q.r;ball={c:loose.c,r:loose.r,owner:null};return false;}
  a.c=q.c;a.r=q.r;ball={c:loose.c,r:loose.r,owner:null};return false;
 }
 // Espejo de moveBall(): validaciones, precisión, trayectoria desviada, intercepción, arquero, gol y pase.
 function fuV98SimBall(x,c,r,goals){
  if(freeKickRequiredId!==null&&freeKickAwardedTeam===turn&&actionNo===1&&x.id!==freeKickRequiredId)return 'blocked';
  if(kickoffPassRequired){
   const intendedReceiver=at(c,r,x.id);
   if(!isKickoffKicker(x)||!intendedReceiver||intendedReceiver.t!==x.t)return 'blocked';
  }
  if(ball.owner!==x.id||!bLegalFor(c,r,x))return 'blocked';
  if(restartPassOnlyId===x.id&&((x.t===1&&c===C-1&&r>=4&&r<=6)||(x.t===2&&c===0&&r>=4&&r<=6)))return 'blocked';
  const from={c:ball.c,r:ball.r,owner:ball.owner};
  let path=passPathCells(from,{c,r}),firstRival=firstTrajectoryRival(path,x.t);
  if(firstRival&&firstRival.index===0)return 'blocked';
  const intendedTarget={c,r},intendedShotTarget=!!goalSideForCell(c,r,x.t);
  const accuracy=resolveAccuracy(x,{c,r});
  c=accuracy.target.c;r=accuracy.target.r;
  path=passPathCells(from,{c,r});firstRival=firstTrajectoryRival(path,x.t);
  if(c<0||c>=C||r<0||r>=R){
   kickoffPassRequired=false;clearFreeKickRequirement(x.id);
   simulateExit({c,r},x.t);
   return true;
  }
  if(!intendedShotTarget&&passBeyondOffsideLine(c,x))return 'blocked';
  const intendedReceiver=at(c,r);
  if(!intendedShotTarget&&intendedReceiver&&intendedReceiver.t===x.t&&isOffsidePosition(intendedReceiver))return 'blocked';
  const goalSide=goalSideForCell(c,r,x.t);
  if(goalSide&&!intendedShotTarget&&!fuV98GoalTargetsFor(x,goalSide).includes(r))return 'blocked';
  if(firstRival&&firstRival.index>0&&firstRival.index<path.length-1){
   const interceptor=firstRival.player;
   const interceptionChance=[2,6].includes(interceptor.n)?0.75:interceptor.n===5?0.65:0.5;
   if(tacticalRandom()<interceptionChance){
    const loose=deflectionCell(interceptor);
    kickoffPassRequired=false;clearFreeKickRequirement(x.id);
    if(restartPassOnlyId===x.id)restartPassOnlyId=null;
    ball={c:loose.c,r:loose.r,owner:null};
    return false;
   }
  }
  if(intendedShotTarget){
   const shotKeeper=p.find(z=>z.t!==x.t&&z.n===1);
   if(shotKeeper&&(goalkeeperBlocksShot(x,from,{c,r},p)||(goalSideForCell(c,r,x.t)&&tacticalRandom()<fuV96KeeperSaveChance(x,from,{c,r},p)))){
    kickoffPassRequired=false;clearFreeKickRequirement(x.id);
    if(restartPassOnlyId===x.id)restartPassOnlyId=null;
    ball={c:shotKeeper.c,r:shotKeeper.r,owner:shotKeeper.id};
    return false;
   }
   if(!goalSide){
    kickoffPassRequired=false;clearFreeKickRequirement(x.id);
    if(restartPassOnlyId===x.id)restartPassOnlyId=null;
    const defendingTeam=x.t===1?2:1;
    simulateRestart(defendingTeam,true,defendingTeam===1?1:C-2,5);
    return true;
   }
  }
  if(goalSide){
   kickoffPassRequired=false;clearFreeKickRequirement(x.id);
   return simulateScoreGoal(x.t,goals);
  }
  const receiver=at(c,r,x.id);
  const rest=!receiver&&(at(c,r)||{}).id===x.id&&typeof fuV98ShortPassRestCell==='function'?fuV98ShortPassRestCell(x,from,intendedTarget):null;
  if(rest){c=rest.c;r=rest.r;}
  kickoffPassRequired=false;clearFreeKickRequirement(x.id);
  if(receiver&&receiver.t===x.t)recordStrategicPass(x,receiver,{c:from.c,r:from.r},{c,r});
  ball={c,r,owner:receiver?receiver.id:null};
  if(restartPassOnlyId===x.id)restartPassOnlyId=null;
  return false;
 }
 function fuV98SimulateOneAction(a,goals){
  if(!a)return 'blocked';
  // La acción se aplica siempre a las fichas vivas del tablero simulado, buscadas por id.
  const x=p.find(z=>z.id===(a.playerId??a.player?.id));
  if(!x||x.t!==turn)return 'blocked';
  if(a.kind==='move'||a.kind==='carry'||a.kind==='collect')return fuV98SimMove(x,a.to.c,a.to.r);
  if(a.kind==='duel'){const r=p.find(z=>z.id===(a.opponentId??a.opponent?.id));return r?fuV98SimDuel(x,r):'blocked';}
  if(a.kind==='pass'||a.kind==='shoot')return fuV98SimBall(x,a.to.c,a.to.r,goals||[0,0]);
  return 'blocked';
 }
 const fuV98LegacySimulateOneAction=simulateOneAction;
 simulateOneAction=fuV98SimulateOneAction;
 // Los reinicios simulados limpian el tiro libre, como prepareRestart() y resetToKickoff() en el partido.
 const fuV98LegacySimulateRestart=simulateRestart;
 simulateRestart=function(team,isGoalKick,c,r){const out=fuV98LegacySimulateRestart(team,isGoalKick,c,r);freeKickRequiredId=null;freeKickAwardedTeam=null;return out;};
 const fuV98LegacySimulateResetToKickoff=simulateResetToKickoff;
 simulateResetToKickoff=function(kickTeam){const out=fuV98LegacySimulateResetToKickoff(kickTeam);freeKickRequiredId=null;freeKickAwardedTeam=null;return out;};
 // ================== FIN FÚTBOL ÚNICO v98 · SIMULACIÓN COHERENTE ==================
`;

// v98 · Fase 2 de IA: decisiones de la CPU. No cambia reglas, probabilidades ni el partido real: solo cómo
// la CPU valora las posiciones y elige entre jugadas legales, con la misma información que ve el jugador.
const V98_AI_PATCH = String.raw`
 // ==================== FÚTBOL ÚNICO v98 · IA (FASE 2) ====================
 // Cada mejora tiene su interruptor para poder medirla por separado; con enabled=false la CPU decide como antes.
 const fuV98Ai={enabled:true,risk:true,shots:true,anticipation:true,variety:true,varietyMargin:4};
 // ---- Memoria de cálculos del mismo estado (no cambia resultados: mismas funciones, mismas posiciones) ----
 function fuV98StateKey(){let k=ball.c+','+ball.r+','+ball.owner+'|';for(const z of p)k+=z.c+','+z.r+';';return k;}
 let fuV98ThreatKey=null,fuV98ThreatValue=null,fuV98AttackKey=null,fuV98AttackValue=null;
 const fuV98PrevThreatOptions=fuV96ThreatOptions;
 fuV96ThreatOptions=function(playersState=p,carrierId=ball.owner){
  if(playersState!==p||carrierId!==ball.owner)return fuV98PrevThreatOptions(playersState,carrierId);
  const key=fuV98StateKey();
  if(key!==fuV98ThreatKey){fuV98ThreatValue=fuV98PrevThreatOptions(playersState,carrierId);fuV98ThreatKey=key;}
  return fuV98ThreatValue;
 };
 const fuV98PrevAttackingThreat=estimateAttackingThreat;
 estimateAttackingThreat=function(playersState=p,carrierId=ball.owner){
  if(playersState!==p||carrierId!==ball.owner)return fuV98PrevAttackingThreat(playersState,carrierId);
  const key=fuV98StateKey();
  if(key!==fuV98AttackKey){fuV98AttackValue=fuV98PrevAttackingThreat(playersState,carrierId);fuV98AttackKey=key;}
  return fuV98AttackValue;
 };

 // ======== Etapa 2a ========
 // ---- 1. Riesgo según marcador y tiempo restante (solo datos públicos: marcador y reloj) ----
 // En el último 40% del partido, perdiendo por uno o dos la CPU valora más un gol propio y su amenaza
 // ofensiva que el riesgo de recibir otro; ganando por uno o dos, prioriza no conceder y conservar la pelota.
 function fuV98RiskContext(){
  const total=MATCH_GAME_ACTIONS||360,left=Math.max(0,total-matchClockActions),frac=left/total;
  const diff=score[CPU_TEAM-1]-score[HUMAN_TEAM-1];
  const u=Math.max(0,Math.min(1,(0.40-frac)/0.40));
  const ctx={goalFor:1,goalAgainst:1,threatFor:1,threatAgainst:1,keepBall:0,push:0,urgency:u,diff};
  if(u<=0||diff===0||Math.abs(diff)>=3)return ctx;
  const k=Math.abs(diff)===1?1:0.65;
  if(diff<0){ctx.goalFor=1+0.45*u*k;ctx.goalAgainst=1-0.30*u*k;ctx.threatFor=1+0.35*u*k;ctx.threatAgainst=1-0.20*u*k;ctx.push=u*k;}
  else{ctx.goalFor=1-0.20*u*k;ctx.goalAgainst=1+0.45*u*k;ctx.threatFor=1-0.15*u*k;ctx.threatAgainst=1+0.40*u*k;ctx.keepBall=u*k;}
  return ctx;
 }
 const fuV98PrevEvaluate=evaluateSequencePosition;
 evaluateSequencePosition=function(rootTeam,goalDiff){
  let value=fuV98PrevEvaluate(rootTeam,goalDiff);
  if(!fuV98Ai.enabled||!fuV98Ai.risk||rootTeam!==CPU_TEAM)return value;
  const ctx=fuV98RiskContext();
  if(ctx.urgency<=0||ctx.goalFor===1&&ctx.goalAgainst===1)return value;
  value+=(goalDiff[CPU_TEAM-1]||0)*320*(ctx.goalFor-1)-(goalDiff[HUMAN_TEAM-1]||0)*320*(ctx.goalAgainst-1);
  const holder=owner();
  if(holder){
   const threat=estimateAttackingThreat(p,holder.id).probability;
   if(holder.t===CPU_TEAM)value+=threat*145*(ctx.threatFor-1)+ctx.keepBall*8+ctx.push*attackingProgress(CPU_TEAM,ball.c)*10;
   else value-=threat*145*(ctx.threatAgainst-1)+ctx.keepBall*8;
  }
  return value;
 };

 // ======== Etapa 2b ========
 // ---- 2. Remates por valor esperado y 4. variedad controlada (decisión de la raíz) ----
 // Cada jugada raíz se evalúa con las mismas tres muestras de azar que antes. Con tres muestras, un remate del
 // 30% puede contar como 0% o como 67% de gol según la suerte fija de esas semillas; ahora el valor del remate
 // pondera los resultados con gol y sin gol por la probabilidad de gol que calcula el motor (la misma que ve el
 // jugador). Si en las muestras falta una de las dos clases, se evalúa esa consecuencia con la misma búsqueda.
 function fuV98SearchCtx(){return {nodes:0,width:2,status:{textContent:''}};}
 async function fuV98ShotOutcomeValue(rootState,shotKey,goal){
  restoreSequenceState(rootState);forcedSearchPlanId=null;forcedSearchPlanTeam=null;simulationRandomState=CPU_SEARCH_SEEDS[0];
  const a=tacticalCandidates().find(x=>sequenceActionKey(x)===shotKey);if(!a)return null;
  const shooter=p.find(z=>z.id===a.playerId);
  if(goal){
   const goals=[0,0];simulateScoreGoal(CPU_TEAM,goals);
   return (await searchSequenceNode(CPU_SEARCH_DEPTH-1,CPU_TEAM,goals,-Infinity,Infinity,fuV98SearchCtx())).value;
  }
  // Sin gol: el arquero rival queda con la pelota (atajada), la consecuencia más frecuente de un remate al arco.
  const keeper=p.find(z=>z.t!==CPU_TEAM&&z.n===1);if(!keeper||!shooter)return null;
  ball={c:keeper.c,r:keeper.r,owner:keeper.id};kickoffPassRequired=false;clearFreeKickRequirement(shooter.id);
  if(restartPassOnlyId===shooter.id)restartPassOnlyId=null;
  advanceSimulatedAction(false,shooter.id);
  return (await searchSequenceNode(CPU_SEARCH_DEPTH-1,CPU_TEAM,[0,0],-Infinity,Infinity,fuV98SearchCtx())).value;
 }
 function fuV98PickRoot(scored){
  scored.sort((a,b)=>b.mean-a.mean);
  const best=scored[0];
  if(!fuV98Ai.variety)return best.key;
  const near=scored.filter(s=>s.mean>=best.mean-fuV98Ai.varietyMargin);
  if(near.length<2)return best.key;
  // Azar del propio partido en el momento de decidir: no anticipa ninguna tirada de las jugadas.
  const weights=near.map(s=>Math.exp((s.mean-best.mean)/2)),total=weights.reduce((x,y)=>x+y,0);
  let r=Math.random()*total;
  for(let i=0;i<near.length;i++){r-=weights[i];if(r<=0)return near[i].key;}
  return best.key;
 }
 let fuV98LastDecision=null;
 const fuV98PrevChooseCpuMove=chooseCpuMove;
 chooseCpuMove=async function(token){
  if(!fuV98Ai.enabled)return fuV98PrevChooseCpuMove(token);
  const rootState=captureSequenceState();
  const rootKeys=cpuSearchCandidateKeys();
  if(!rootKeys.length)return null;
  const scored=[];
  try{
   for(let ki=0;ki<rootKeys.length;ki++){
    let total=0,samples=0,shotP=null;const goalValues=[],otherValues=[];
    for(let si=0;si<CPU_SEARCH_SEEDS.length;si++){
     if(token!==cpuEpoch||!cpuAutoEnabled)return null;
     restoreSequenceState(rootState);forcedSearchPlanId=null;forcedSearchPlanTeam=null;simulationRandomState=CPU_SEARCH_SEEDS[si];
     const a=tacticalCandidates().find(x=>sequenceActionKey(x)===rootKeys[ki]);
     if(!a)continue;
     if(a.kind==='shoot'&&shotP===null)shotP=Math.max(0,Math.min(1,Number(a.goalProbability)||0));
     const goals=[0,0],result=simulateOneAction(a,goals);let value;
     if(result==='blocked')value=evaluateSequencePosition(CPU_TEAM,[0,0])-16;
     else{
      advanceSimulatedAction(result,a.playerId);
      const child=await searchSequenceNode(CPU_SEARCH_DEPTH-1,CPU_TEAM,goals,-Infinity,Infinity,fuV98SearchCtx());
      value=child.value;
     }
     total+=value;samples++;
     if(a.kind==='shoot'&&result!=='blocked')(goals[CPU_TEAM-1]>0?goalValues:otherValues).push(value);
     restoreSequenceState(rootState);
    }
    if(!samples)continue;
    let mean=total/samples;const sampledMean=mean;let shotDetail=null;
    if(fuV98Ai.shots&&shotP!==null&&goalValues.length+otherValues.length===samples){
     const avg=v=>v.reduce((x,y)=>x+y,0)/v.length;
     const vGoal=goalValues.length?avg(goalValues):await fuV98ShotOutcomeValue(rootState,rootKeys[ki],true);
     const vOther=otherValues.length?avg(otherValues):await fuV98ShotOutcomeValue(rootState,rootKeys[ki],false);
     restoreSequenceState(rootState);
     if(vGoal!==null&&vOther!==null){mean=shotP*vGoal+(1-shotP)*vOther;shotDetail={p:shotP,vGoal,vOther,goalSamples:goalValues.length,otherSamples:otherValues.length};}
    }
    scored.push({key:rootKeys[ki],mean,sampledMean,shot:shotDetail});
    if(token!==cpuEpoch||!cpuAutoEnabled)return null;
   }
  }finally{
   restoreSequenceState(rootState);forcedSearchPlanId=null;forcedSearchPlanTeam=null;simulationRandomState=rootState.simulationRandomState;
   activeTacticalPlan=chooseTacticalPlan(turn,owner());
  }
  if(!scored.length)return null;
  const pick=fuV98PickRoot(scored);
  // Diagnóstico interno de la última decisión (no cambia la elección).
  fuV98LastDecision={at:matchClockActions,scored:scored.map(x=>({...x})),pick};
  return tacticalCandidates().find(a=>sequenceActionKey(a)===pick)||null;
 };
 // ======== Etapa 2c ========
 // ---- 3. Anticipación defensiva: en el turno rival, la búsqueda incluye su opción más peligrosa ----
 // La lista corta de respuestas rivales sale de la heurística general; si la amenaza principal del poseedor
 // (remate, pase para remate o conducción para remate, según el mapa de amenazas de v96) no está, reemplaza
 // la última respuesta. La CPU no ve ninguna tirada futura: solo considera esa jugada posible del rival.
 function fuV98WithMostDangerous(shortlist,candidates){
  const holder=owner();
  if(!holder||holder.t===CPU_TEAM||!shortlist.length)return shortlist;
  const top=fuV96ThreatOptions(p,holder.id)[0];
  if(!top||top.probability<0.12)return shortlist;
  const mine=candidates.filter(a=>a.playerId===holder.id);
  let match=null;
  if(top.type==='direct')match=mine.filter(a=>a.kind==='shoot').sort((x,y)=>(y.goalProbability||0)-(x.goalProbability||0))[0]||null;
  else if(top.type==='pass-shot')match=mine.find(a=>a.kind==='pass'&&a.receiverId===top.receiverId)||null;
  else if(top.type==='carry-shot'){const cell=top.path&&top.path[0];match=cell?mine.find(a=>a.kind==='carry'&&a.to.c===cell.c&&a.to.r===cell.r)||null:null;}
  if(!match)return shortlist;
  const key=sequenceActionKey(match);
  if(shortlist.some(a=>sequenceActionKey(a)===key))return shortlist;
  const out=shortlist.slice();
  if(out.length>=2)out[out.length-1]=match;else out.push(match);
  return out;
 }
 async function fuV98SearchSequenceNode(depth,rootTeam,goalDiff,alpha,beta,ctx){
  sequenceVisitedNodes++;ctx.nodes++;
  if(ctx.nodes%14===0){ctx.status.textContent='Buscando respuestas rivales… '+ctx.nodes+' nodos explorados · profundidad restante '+depth+'.';await new Promise(resolve=>setTimeout(resolve,0));}
  const staticValue=evaluateSequencePosition(rootTeam,goalDiff);
  if(depth<=0)return {value:staticValue,pv:[]};
  const candidates=tacticalCandidates();
  if(!candidates.length)return {value:staticValue-5,pv:[]};
  const maximizing=turn===rootTeam;
  let shortlist=chooseSearchActions(candidates,ctx.width);
  if(!maximizing&&fuV98Ai.enabled&&fuV98Ai.anticipation)shortlist=fuV98WithMostDangerous(shortlist,candidates);
  let bestValue=maximizing?-Infinity:Infinity,bestPv=[];
  for(const a of shortlist){
   const snap=captureSequenceState(),beforeTurn=turn,beforeAction=actionNo,goals=[0,0];
   const actionSummary=sequenceActionSummary(a,beforeTurn,beforeAction);
   const result=simulateOneAction(a,goals);
   let value,pv;
   if(result==='blocked'){value=evaluateSequencePosition(rootTeam,goalDiff)-4;pv=[{...actionSummary,label:actionSummary.label+' (bloqueada en esta simulación)'}];}
   else{
    advanceSimulatedAction(result,a.playerId);
    const nextDiff=[goalDiff[0]+goals[0],goalDiff[1]+goals[1]];
    const child=await searchSequenceNode(depth-1,rootTeam,nextDiff,alpha,beta,ctx);
    value=child.value;pv=[actionSummary,...child.pv];
   }
   restoreSequenceState(snap);
   if(maximizing){if(value>bestValue){bestValue=value;bestPv=pv;}alpha=Math.max(alpha,bestValue);}
   else{if(value<bestValue){bestValue=value;bestPv=pv;}beta=Math.min(beta,bestValue);}
   if(beta<=alpha)break;
  }
  return {value:bestValue,pv:bestPv};
 }
 searchSequenceNode=fuV98SearchSequenceNode;

 // ================== FIN FÚTBOL ÚNICO v98 · IA (FASE 2) ==================
`;

(() => {
  "use strict";
  const BASELINE_COMMIT = "d62eae16f15984cdb4397b93d8c4a34e89392efd";
  const BASELINE_ENGINE_BLOB = "2a310f81554383936556146cbaabc31e3dbbdfcf";
  const BASE = new URL("./", document.baseURI).href;
  const PAGE_LABELS = { home: "Inicio", practice: "Práctica", tournament: "Torneo", match: "Partido" };
  const PAGE_PATHS = { home: "index.html", practice: "practica/index.html", tournament: "torneo/index.html", match: "torneo/partido.html" };
  const BASELINE_BLOBS = {
    "index.html": "073d34fc0b90b52ba88601fd3bca9abc741c6e1c",
    "practica/index.html": BASELINE_ENGINE_BLOB,
    "torneo/index.html": "21b1d396a5f2629f51273a180ccbd0cc48551a52",
    "torneo/partido.html": BASELINE_ENGINE_BLOB
  };
  const PAGE_BASES = { home: "", practice: "practica/", tournament: "torneo/", match: "torneo/" };
  const $ = (id) => document.getElementById(id);
  const stage = $("fuGameStage");
  const loading = $("fuLoading");
  const errorPanel = $("fuError");
  const statusTitle = $("fuStatusTitle");
  const statusText = $("fuStatusText");
  const statusDot = $("fuStatusDot");
  let page = pageFromUrl();
  let activeIframe = null;
  let activeReport = null;
  let latestAudit = null;
  let loadAttempt = 0;

  function pageFromUrl() {
    const value = new URLSearchParams(window.location.search).get("page");
    return value === "practice" || value === "tournament" || value === "match" ? value : "home";
  }
  function baselineUrl(path) { return new URL(`baseline/${path}`, BASE).href; }
  async function fetchOriginal(path) {
    const response = await fetch(baselineUrl(path), { cache: "no-cache" });
    if (!response.ok) throw new Error(`No se pudo cargar el archivo local ${path} (HTTP ${response.status}). El ZIP publicado debe incluir la carpeta baseline.`);
    const html = await response.text();
    if (!html.includes("<!doctype html") && !html.includes("<!DOCTYPE html")) throw new Error(`El archivo local ${path} no contiene el HTML esperado.`);
    return html;
  }
  async function gitBlobSha1(content) {
    if (!globalThis.crypto?.subtle) return null;
    const body = new TextEncoder().encode(content);
    const header = new TextEncoder().encode(`blob ${body.byteLength}\0`);
    const value = new Uint8Array(header.byteLength + body.byteLength);
    value.set(header, 0); value.set(body, header.byteLength);
    const digest = await globalThis.crypto.subtle.digest("SHA-1", value);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  function replaceOnce(html, search, replacement, label, report) {
    if (!html.includes(search)) { report.warnings.push(`No se encontró el punto de parche: ${label}`); return html; }
    report.patches.push(label);
    return html.replace(search, replacement);
  }
  function patchSimulationParity(html, report) {
    html = replaceOnce(html,
      "const CPU_SEARCH_DEPTH=5; // Un movimiento más de anticipación que el motor anterior.",
      "const CPU_SEARCH_DEPTH=6; // v96: completa tambien la respuesta rival dentro del horizonte.",
      "horizonte CPU de seis acciones", report);
    const earlyInterception = `   if(risk.first&&risk.first.index>0&&risk.first.index<passPathCells({c:ball.c,r:ball.r},a.to).length-1&&tacticalRandom()<risk.risk){
    const loose=deflectionCell(risk.first.player);ball={c:loose.c,r:loose.r,owner:null};
    if(restartPassOnlyId===a.playerId)restartPassOnlyId=null;
    kickoffPassRequired=false;
    return false;
   }
   const accuracy=resolveAccuracy(a.player,{c:a.to.c,r:a.to.r}),target=accuracy.target;`;
    html = replaceOnce(html, earlyInterception,
      `   // v96: igual que moveBall(), primero se resuelve precision y legalidad del destino.
   const accuracy=resolveAccuracy(a.player,{c:a.to.c,r:a.to.r}),target=accuracy.target;`,
      "paridad de orden precision/intercepcion", report);
    const simulatedReceiver = `   const receiver=at(target.c,target.r);
   if(receiver&&receiver.t===team&&isOffsidePosition(receiver))return 'blocked';
   if(goalSide){`;
    html = replaceOnce(html, simulatedReceiver,
      `   const receiver=at(target.c,target.r);
   if(receiver&&receiver.t===team&&isOffsidePosition(receiver))return 'blocked';
   // v96: la tirada de intercepcion ocurre en el mismo punto que en el motor visible.
   if(risk.first&&risk.first.index>0&&risk.first.index<passPathCells({c:ball.c,r:ball.r},a.to).length-1&&tacticalRandom()<risk.risk){
    const loose=deflectionCell(risk.first.player);ball={c:loose.c,r:loose.r,owner:null};
    if(restartPassOnlyId===a.playerId)restartPassOnlyId=null;
    kickoffPassRequired=false;
    return false;
   }
   if(goalSide){`,
      "intercepcion simulada diferida", report);
    const simulatedDuel = `   if(r.n===1&&ball.owner===r.id)return 'blocked';
   if(a.duelOutcome==='frente'){`;
    html = replaceOnce(html, simulatedDuel,
      `   if(r.n===1&&ball.owner===r.id)return 'blocked';
   // v96: el minimax ya no obtiene duelos gratuitos; usa los mismos porcentajes de falta.
   const simulatedDuelType=a.duelType||(Math.abs(dc)===1&&Math.abs(dr)===1?'costado':duelType(x,r));
   const simulatedFoulChance=simulatedDuelType==='atras'?.60:simulatedDuelType==='costado'?.30:0;
   if(simulatedFoulChance>0&&tacticalRandom()<simulatedFoulChance){
    const spot={c:r.c,r:r.r},quick=createQuickFoulMoves(r.t,r,spot,x);
    for(const z of p){const q=quick.layout.get(z.id);if(q){z.c=q.c;z.r=q.r;}}
    r.c=spot.c;r.r=spot.r;ball={c:spot.c,r:spot.r,owner:r.id};
    turn=r.t;actionNo=1;lastPlayedId=null;playedThisTurn=[];restartPassOnlyId=null;
    freeKickRequiredId=r.id;freeKickAwardedTeam=r.t;kickoffPassRequired=false;
    return true;
   }
   if(a.duelOutcome==='frente'){`,
      "faltas incluidas en duelos simulados", report);
    return html;
  }
  function patchProgressiveActionResolution(html, report) {
    // V96.1: igualar el traslado con pelota al traslado sin pelota.
  // Se conservan exactamente las mismas distancias y movimientos especiales de pLegal.
  html = replaceOnce(
    html,
    "  // Sin balón: todos avanzan hasta 2 casilleros en línea recta.\n  // Los números 3, 4, 7 y 8 avanzan hasta 3 en línea recta y hasta 2 en diagonal.\n  // Con balón, todos mantienen un máximo de 1 casillero.\n  const hasBall=ball.owner===x.id;\n  const special=[3,4,7,8].includes(x.n);\n  const straight=(dc===0||dr===0);\n  const diagonal=Math.abs(dc)===Math.abs(dr);\n  const dist=Math.max(Math.abs(dc),Math.abs(dr));\n  const maxStraight=!hasBall&&straight&&dist<=(special?3:2);\n  const maxDiagonal=!hasBall&&special&&diagonal&&dist<=2&&dist>0;\n  // Se habilita el salto tipo caballo: 2 casilleros en un eje y 1 en el otro.\n  const knightMove=!hasBall&&special&&((Math.abs(dc)===2&&Math.abs(dr)===1)||(Math.abs(dc)===1&&Math.abs(dr)===2));",
    "  // V96.1: alcance idéntico de traslado con y sin pelota.\n  // Todos: hasta 2 casilleros en línea recta. Jugadores 3, 4, 7 y 8:\n  // hasta 3 casilleros rectos, 2 diagonales y salto tipo caballo (2×1).\n  const special=[3,4,7,8].includes(x.n);\n  const straight=(dc===0||dr===0);\n  const diagonal=Math.abs(dc)===Math.abs(dr);\n  const dist=Math.max(Math.abs(dc),Math.abs(dr));\n  const maxStraight=straight&&dist<=(special?3:2);\n  const maxDiagonal=special&&diagonal&&dist<=2&&dist>0;\n  // El salto tipo caballo también está habilitado con o sin pelota.\n  const knightMove=special&&((Math.abs(dc)===2&&Math.abs(dr)===1)||(Math.abs(dc)===1&&Math.abs(dr)===2));",
    "alcance idéntico de movimiento con y sin balón v96.1",
    report,
  );

  // El motor compartido debe conservar si la acción elegida fue un remate,
    // incluso cuando su desviación termina fuera de las tres casillas del arco.
    html = replaceOnce(
      html,
      "  const path=passPathCells(from,{c,r});\n  const firstRival=firstTrajectoryRival(path,x.t);",
      "  let path=passPathCells(from,{c,r});\n  let firstRival=firstTrajectoryRival(path,x.t);",
      "trayectoria recalculada tras desviaciones",
      report,
    );
    html = replaceOnce(
      html,
      "  const accuracy=resolveAccuracy(x,{c,r});\n  c=accuracy.target.c;r=accuracy.target.r;",
      "  const intendedTarget={c,r};\n  const intendedShotTarget=!!goalSideForCell(c,r,x.t);\n  const accuracy=resolveAccuracy(x,{c,r});\n  c=accuracy.target.c;r=accuracy.target.r;\n  path=passPathCells(from,{c,r});\n  firstRival=firstTrajectoryRival(path,x.t);",
      "distinguir remate elegido de resultado desviado",
      report,
    );
    html = replaceOnce(
      html,
      "  if(passBeyondOffsideLine(c,x)){",
      "  if(!intendedShotTarget&&passBeyondOffsideLine(c,x)){",
      "fuera de juego solo para pases",
      report,
    );
    html = replaceOnce(
      html,
      "  if(intendedReceiver&&intendedReceiver.t===x.t&&isOffsidePosition(intendedReceiver)){",
      "  if(!intendedShotTarget&&intendedReceiver&&intendedReceiver.t===x.t&&isOffsidePosition(intendedReceiver)){",
      "fuera de juego del receptor solo para pases",
      report,
    );
    html = replaceOnce(
      html,
      "   if(!valid){say('El arquero bloquea ese ingreso al área chica.');return}",
      "   if(!valid&&!intendedShotTarget){say('El arquero bloquea ese ingreso al área chica.');return}",
      "el remate desviado se resuelve como jugada y no se cancela",
      report,
    );
    html = replaceOnce(
      html,
      "    beginManualAction(goalSideForCell(c,r,x.t)?'shoot':'pass',x,{from:{c:from.c,r:from.r},to:{c,r},interceptorNo:interceptor.n,interception:true});",
      "    beginManualAction(intendedShotTarget?'shoot':'pass',x,{from:{c:from.c,r:from.r},to:{c,r},intendedTo:intendedTarget,interceptorNo:interceptor.n,interception:true});",
      "registrar remates interceptados como remates",
      report,
    );
    html = replaceOnce(
      html,
      "  if(goalSide){\n   kickoffPassRequired=false;\n   clearFreeKickRequirement(x.id);\n   beginManualAction('shoot',x,{from:{c:from.c,r:from.r},to:{c,r},intendedTo:{c:accuracy.target.c,r:accuracy.target.r},goalSide});",
      `  if(intendedShotTarget){
     const shotKeeper=p.find(z=>z.t!==x.t&&z.n===1);
     if(shotKeeper&&(goalkeeperBlocksShot(x,from,{c,r},p)||(goalSideForCell(c,r,x.t)&&tacticalRandom()<fuV96KeeperSaveChance(x,from,{c,r},p)))){
      kickoffPassRequired=false;clearFreeKickRequirement(x.id);
      beginManualAction('shoot',x,{from:{c:from.c,r:from.r},to:{c,r},intendedTo:intendedTarget,keeperSave:true});
      if(restartPassOnlyId===x.id)restartPassOnlyId=null;
      ball={c:shotKeeper.c,r:shotKeeper.r,owner:shotKeeper.id};
      animationFinish('¡Atajada! El arquero detuvo el remate.',animateBall(from,{c:shotKeeper.c,r:shotKeeper.r,owner:shotKeeper.id},{arc:true,goal:true,duration:850}));
      return;
     }
     if(!goalSide){
      kickoffPassRequired=false;clearFreeKickRequirement(x.id);
      beginManualAction('shoot',x,{from:{c:from.c,r:from.r},to:{c,r},intendedTo:intendedTarget,shotMiss:true});
      if(restartPassOnlyId===x.id)restartPassOnlyId=null;
      ball={c,r,owner:null};
      const defendingTeam=x.t===1?2:1,goalKickC=defendingTeam===1?1:C-2;
      anim=true;
      Promise.resolve(animateBall(from,{c,r,owner:null},{arc:true,goal:true,duration:750}))
       .then(()=>prepareRestart('goal-kick',defendingTeam,goalKickC,5))
       .catch(()=>prepareRestart('goal-kick',defendingTeam,goalKickC,5));
      return;
     }
    }
    if(goalSide){
     kickoffPassRequired=false;
     clearFreeKickRequirement(x.id);
     beginManualAction('shoot',x,{from:{c:from.c,r:from.r},to:{c,r},intendedTo:intendedTarget,goalSide});`,
      "remate desviado, atajada y saque de arco",
      report,
    );
    html = replaceOnce(
      html,
      "  const receiver=at(c,r);\n  kickoffPassRequired=false;",
      "  const receiver=at(c,r,x.id);\n  kickoffPassRequired=false;",
      "un pase corto no se recibe por el mismo pasador",
      report,
    );
    // La zona de alcance se mantiene, pero ya no comunica falsamente 100%/50%/0%.
    html = replaceOnce(
      html,
      "  // Amarillo = 100% exacto; naranja = 50/50; rojo = 0% de precisión (desvío seguro).",
      "  // La zona tenue indica alcance; los porcentajes junto al arco muestran la probabilidad de gol estimada.",
      "leyenda visual acorde a la precisión progresiva",
      report,
    );
    html = replaceOnce(
      html,
      "  const reach=BALL_REACH(x.n),a=ACCURACY_RANGES(x.n);",
      "  const reach=BALL_REACH(x.n);",
      "presentación de alcance sin rangos de precisión obsoletos",
      report,
    );
    html = replaceOnce(
      html,
      "  addBand(reach,a.half[1],'#ff3030',.12);\n  addBand(a.half[1],a.exact,'#ff8a00',.16);\n  addBand(a.exact,0,'#ffe600',.17);",
      "  add(reach,'#fff7b0',.045);",
      "zona de alcance neutral",
      report,
    );
    // Actualizar controles de auditoría que comprobaban la antigua precisión por escalones.
    html = replaceOnce(
      html,
      "check('Porcentaje calculado desde la fila real del balón',realOriginShot.probability<wrongOriginShot.probability&&Math.abs(realOriginShot.probability-.5)<.001&&Math.abs(wrongOriginShot.probability-1)<.001,`Origen real ${Math.round(realOriginShot.probability*100)}%; fila incorrecta ${Math.round(wrongOriginShot.probability*100)}%.`);",
      "check('Porcentaje calculado desde la fila real del balón',realOriginShot.probability<wrongOriginShot.probability&&realOriginShot.probability>0&&wrongOriginShot.probability<.99,`Origen real ${Math.round(realOriginShot.probability*100)}%; fila incorrecta ${Math.round(wrongOriginShot.probability*100)}%.`);",
      "auditoría de probabilidad con curva progresiva",
      report,
    );
    html = replaceOnce(
      html,
      "check('Distribución de desvíos suma 100%',[exactOutcomes,mediumOutcomes,lowOutcomes].every(arr=>Math.abs(totalWeight(arr)-1)<.001)&&exactOutcomes.length===1&&mediumOutcomes.length===9&&lowOutcomes.length===16,`Resultados posibles: ${exactOutcomes.length}, ${mediumOutcomes.length} y ${lowOutcomes.length}; todas las distribuciones suman 100%.`);",
      "check('Distribución lateral progresiva suma 100%',[exactOutcomes,mediumOutcomes,lowOutcomes].every(arr=>Math.abs(totalWeight(arr)-1)<.001)&&exactOutcomes.length>1&&mediumOutcomes.length>=exactOutcomes.length&&lowOutcomes.length>=mediumOutcomes.length,`Resultados posibles: ${exactOutcomes.length}, ${mediumOutcomes.length} y ${lowOutcomes.length}; todas las distribuciones suman 100%.`);",
      "auditoría de desviación lateral progresiva",
      report,
    );
    // El simulador de la CPU utiliza las mismas consecuencias de un remate desviado.
    html = replaceOnce(
      html,
      "   const accuracy=resolveAccuracy(a.player,{c:a.to.c,r:a.to.r}),target=accuracy.target;\n   if(simulateExit(target,team)){kickoffPassRequired=false;if(restartPassOnlyId===a.playerId)restartPassOnlyId=null;return true;}\n   const goalSide=goalSideForCell(target.c,target.r,team);",
      `   const intendedShot=a.kind==='shoot';
     const accuracy=resolveAccuracy(a.player,{c:a.to.c,r:a.to.r}),target=accuracy.target;
     if(simulateExit(target,team)){kickoffPassRequired=false;if(restartPassOnlyId===a.playerId)restartPassOnlyId=null;return true;}
     const goalSide=goalSideForCell(target.c,target.r,team);
     if(intendedShot&&!isGoalCell(target.c,target.r,team===1?'R':'L')){
      ball={c:target.c,r:target.r,owner:null};if(restartPassOnlyId===a.playerId)restartPassOnlyId=null;
      kickoffPassRequired=false;simulateRestart(team===1?2:1,true,team===1?C-2:1,5);return false;
     }`,
      "simulación de remate desviado y saque de arco",
      report,
    );
    html = replaceOnce(html,
      "   if(passBeyondOffsideLine(target.c,a.player))return 'blocked';",
      "   if(a.kind!=='shoot'&&passBeyondOffsideLine(target.c,a.player))return 'blocked';",
      "fuera de juego solo bloquea pases en simulación", report);
    html = replaceOnce(html,
      "   if(receiver&&receiver.t===team&&isOffsidePosition(receiver))return 'blocked';",
      "   if(a.kind!=='shoot'&&receiver&&receiver.t===team&&isOffsidePosition(receiver))return 'blocked';",
      "el fuera de juego no cancela un remate desviado", report);
    html = replaceOnce(
      html,
      "   const receiver=at(target.c,target.r);",
      "   const receiver=at(target.c,target.r,a.player.id);",
      "simulación de pase corto sin autorreceptor",
      report,
    );
    html = replaceOnce(
      html,
      "    if(!goalTargets(side).includes(target.r))return 'blocked';",
      "    const keeper=p.find(z=>z.t!==team&&z.n===1);if(keeper&&(goalkeeperBlocksShot(a.player,from,target,p)||tacticalRandom()<fuV96KeeperSaveChance(a.player,from,target,p))){ball={c:keeper.c,r:keeper.r,owner:keeper.id};if(restartPassOnlyId===a.playerId)restartPassOnlyId=null;kickoffPassRequired=false;return false;}",
      "simulación de atajada sin cancelar la acción",
      report,
    );
    const oldCarrierMoves = `for(let r=Math.max(0,x.r-1);r<=Math.min(R-1,x.r+1);r++)for(let c=Math.max(0,x.c-1);c<=Math.min(C-1,x.c+1);c++){
      if(!pLegal(c,r,x)||at(c,r,x.id)||isOffsideMove(c,x)||forbidsBackLineAdvance(x,c,holder,team))continue;
      const before=nearOpponents(team,x,1),after=nearOpponents(team,{c,r},1);
      const progress=(c-x.c)*dir;
      const safety=(before-after)*5;
      const central=(r>=3&&r<=7)?2:0;
      add({kind:'carry',player:x,playerId:x.id,from:{c:x.c,r:x.r},to:{c,r},progress,score:29+progress*7+safety+central,mode:'carrier'});
     }`;
    const allLegalCarrierMoves = `for(let r=0;r<R;r++)for(let c=0;c<C;c++){
      if(!pLegal(c,r,x)||at(c,r,x.id)||isOffsideMove(c,x)||forbidsBackLineAdvance(x,c,holder,team))continue;
      const before=nearOpponents(team,x,1),after=nearOpponents(team,{c,r},1);
      const progress=(c-x.c)*dir;
      const safety=(before-after)*5;
      const central=(r>=3&&r<=7)?2:0;
      add({kind:'carry',player:x,playerId:x.id,from:{c:x.c,r:x.r},to:{c,r},progress,score:29+progress*7+safety+central,mode:'carrier'});
     }`;
    html = replaceOnce(html, oldCarrierMoves, allLegalCarrierMoves, "CPU evalúa todos los traslados legales con pelota", report);
    return html;
  }

  // v98 · Coherencia del balón cuando un pase fallido no sale de la casilla del pasador.
  // Corrección del motor: no cambia reglas, probabilidades, resolución de acciones, IA ni cronómetro.
  // Cada reemplazo comprueba que exista fuV98ShortPassRestCell, así que nunca deja una referencia rota.
  function patchShortPassLooseBall(html, report) {
    html = replaceOnce(
      html,
      "  const receiver=at(c,r,x.id);\n  kickoffPassRequired=false;\n  clearFreeKickRequirement(x.id);\n",
      "  const receiver=at(c,r,x.id);\n" +
      "  // v98: si el pase fallido no salió de la casilla del pasador, la pelota queda suelta en una casilla libre a su lado.\n" +
      "  const fuV98ShortRest=!receiver&&(at(c,r)||{}).id===x.id&&typeof fuV98ShortPassRestCell==='function'?fuV98ShortPassRestCell(x,from,typeof intendedTarget!=='undefined'?intendedTarget:null):null;\n" +
      "  if(fuV98ShortRest){c=fuV98ShortRest.c;r=fuV98ShortRest.r;}\n" +
      "  kickoffPassRequired=false;\n  clearFreeKickRequirement(x.id);\n",
      "v98: el pase fallido que no sale del pasador deja la pelota suelta en una casilla libre",
      report,
    );
    html = replaceOnce(
      html,
      "  text=accuracy.description+' '+text;\n  if(bypassedInterceptor)",
      "  if(typeof fuV98ShortRest!=='undefined'&&fuV98ShortRest)text='La pelota queda suelta junto al Jugador '+x.n+', en la casilla '+(c+1)+'×'+(r+1)+'.';\n" +
      "  text=accuracy.description+' '+text;\n  if(bypassedInterceptor)",
      "v98: mensaje del pase fallido que queda suelto junto al pasador",
      report,
    );
    html = replaceOnce(
      html,
      "   ball={c:target.c,r:target.r,owner:receiver?receiver.id:null};\n",
      "   // v98: la simulación con la que la CPU anticipa jugadas deja la pelota en la misma casilla libre.\n" +
      "   const fuV98SimRest=!receiver&&(at(target.c,target.r)||{}).id===a.playerId&&typeof fuV98ShortPassRestCell==='function'?fuV98ShortPassRestCell(a.player,from,a.to):null;\n" +
      "   ball=fuV98SimRest?{c:fuV98SimRest.c,r:fuV98SimRest.r,owner:null}:{c:target.c,r:target.r,owner:receiver?receiver.id:null};\n",
      "v98: la simulación de la CPU usa la misma pelota suelta en casilla libre",
      report,
    );
    return html;
  }

  // v98 · Fase 1 de IA: en la simulación de la CPU también rige el tiro libre obligatorio.
  function patchSimulationFreeKick(html, report) {
    return replaceOnce(
      html,
      "  if(freeKickRequiredId!==null&&freeKickAwardedTeam===turn&&actionNo===1&&simulationRandomState===null){",
      "  if(freeKickRequiredId!==null&&freeKickAwardedTeam===turn&&actionNo===1){",
      "v98: la simulación de la CPU respeta el tiro libre obligatorio",
      report,
    );
  }

  function patchTournamentCpuProfiles(html, report) {
    html = replaceOnce(
      html,
      "const clubById=id=>CLUBS.find(c=>c.id===id);",
      `const clubById=id=>CLUBS.find(c=>c.id===id);
const CPU_TACTIC_PROFILES=[
 {id:'defensive',label:'Defensivo'},
 {id:'balanced',label:'Equilibrado'},
 {id:'aggressive',label:'Agresivo'},
 {id:'cautious',label:'Cauteloso'},
 {id:'counter',label:'Contraatacador'},
 {id:'adaptive',label:'Adaptativo'}
];
function cpuProfileHash(value){let h=2166136261;for(const ch of String(value))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;}
function makeCpuProfiles(seed='liga'){
 const ordered=CLUBS.map(c=>({id:c.id,key:cpuProfileHash(seed+'|'+c.id)})).sort((a,b)=>a.key-b.key||a.id.localeCompare(b.id));
 const profiles={};ordered.forEach((item,index)=>{profiles[item.id]=CPU_TACTIC_PROFILES[index%CPU_TACTIC_PROFILES.length].id;});return profiles;
}
function ensureCpuProfiles(){if(!state)return;const seed=(state.selectedClubId||'liga')+'|'+(state.createdAt||state.season||'legacy');const generated=makeCpuProfiles(seed);state.cpuProfiles={...generated,...(state.cpuProfiles||{})};}`,
      "asignación equilibrada de perfil por club", report);
    html = replaceOnce(html,
      "function loadState(){try{state=JSON.parse(localStorage.getItem(STORE)||'null')}catch(_e){state=null}}",
      "function loadState(){try{state=JSON.parse(localStorage.getItem(STORE)||'null')}catch(_e){state=null}if(state&&state.started){ensureCpuProfiles();saveState();}}",
      "migración de temporadas guardadas con identidades", report);
    html = replaceOnce(html,
      "function beginSeason(){if(!chosenClub)return;state={version:1,started:true,season:1,selectedClubId:chosenClub,round:1,durationSeconds:Number($('seasonDuration').value||15),results:{},createdAt:new Date().toISOString()};simulateOtherMatches(1);saveState();renderDashboard();}",
      "function beginSeason(){if(!chosenClub)return;const createdAt=new Date().toISOString();state={version:1,started:true,season:1,selectedClubId:chosenClub,round:1,durationSeconds:Number($('seasonDuration').value||15),results:{},createdAt,cpuProfiles:makeCpuProfiles(chosenClub+'|'+createdAt)};simulateOtherMatches(1);saveState();renderDashboard();}",
      "perfil táctico persistente al iniciar temporada", report);
    html = replaceOnce(html,
      "<th>#</th><th>Club</th><th>PJ</th>",
      "<th>#</th><th>Club</th><th>Perfil rival</th><th>PJ</th>",
      "columna visible de identidad táctica en la tabla", report);
    html = replaceOnce(html,
      "<div class=\"table-club\">${crestMarkup(r.club)}<span title=\"${escapeHtml(r.club.name)}\">${escapeHtml(r.club.name)}</span></div></td><td>${r.pj}</td>",
      "<div class=\"table-club\">${crestMarkup(r.club)}<span title=\"${escapeHtml(r.club.name)}\">${escapeHtml(r.club.name)}</span></div></td><td>${r.club.id===state.selectedClubId?'Tu equipo':((CPU_TACTIC_PROFILES.find(x=>x.id===(state.cpuProfiles||{})[r.club.id])||{}).label||'—')}</td><td>${r.pj}</td>",
      "mostrar perfil táctico de cada rival en la tabla", report);
    html = replaceOnce(html,
      "function playMyMatch(){const fx=currentFixture();if(!fx||state.results[fx.id])return;const opponentId=fx.homeId===state.selectedClubId?fx.awayId:fx.homeId;const q=new URLSearchParams({mode:'torneo',club:state.selectedClubId,opponent:opponentId,fixture:fx.id,round:String(state.round),home:fx.homeId,away:fx.awayId,seconds:String(state.durationSeconds)});location.href=`./partido.html?${q.toString()}`;}",
      "function playMyMatch(){const fx=currentFixture();if(!fx||state.results[fx.id])return;ensureCpuProfiles();const opponentId=fx.homeId===state.selectedClubId?fx.awayId:fx.homeId;const opponent=clubById(opponentId);const q=new URLSearchParams({mode:'torneo',club:state.selectedClubId,opponent:opponentId,cpuProfile:state.cpuProfiles[opponentId]||'balanced',cpuName:opponent?.name||opponentId,fixture:fx.id,round:String(state.round),home:fx.homeId,away:fx.awayId,seconds:String(state.durationSeconds)});parent.postMessage({type:'fu:navigate',page:'match',query:q.toString()},'*');}",
      "paso de identidad del rival a su partido de torneo", report);
    html = replaceOnce(html,
      "function fixtureMarkup(f,mode='round'){const r=state.results[f.id],mine=f.homeId===state.selectedClubId||f.awayId===state.selectedClubId;const h=clubById(f.homeId),a=clubById(f.awayId);return `",
      "function fixtureMarkup(f,mode='round'){const r=state.results[f.id],mine=f.homeId===state.selectedClubId||f.awayId===state.selectedClubId;const h=clubById(f.homeId),a=clubById(f.awayId);const opponentId=f.homeId===state.selectedClubId?f.awayId:f.homeId;const profileId=mine?(state.cpuProfiles||{})[opponentId]:null;const profileLabel=(CPU_TACTIC_PROFILES.find(x=>x.id===profileId)||{}).label;return `",
      "mostrar identidad asignada al rival en el fixture", report);
    html = html.replace(
      "${mine?' · TU PARTIDO':''}",
      "${mine?` · TU PARTIDO${profileLabel?' · CPU '+profileLabel:''}`:''}",
    );
    return html;
  }

    function patchInternalNavigation(html, report) {
    const before = html;
    html = html.replace("location.href=`./partido.html?${q.toString()}`;", "parent.postMessage({type:'fu:navigate',page:'match',query:q.toString()},'*');");
    html = html.replace(/(?:window\.)?location(?:\.href)?\s*=\s*(["'])(?:\.\/)?partido\.html\1\s*;?/g, "parent.postMessage({type:'fu:navigate',page:'match'},'*');");
    if (html !== before) report.patches.push("navegación interna del torneo");
    return html;
  }
  function patchEmbeddedLocation(html, report) {
    const searches = ["new URLSearchParams(location.search)", "new URLSearchParams(window.location.search)"];
    if (!searches.some((search) => html.includes(search))) return html;
    report.patches.push("parámetros de torneo compartidos con el host");
    return searches.reduce((output, search) => output.split(search).join("new URLSearchParams(parent.location.search)"), html);
  }
  function bridgeScript(currentPage) {
    return String.raw`<script id="fu-v96-navigation-bridge">
(function(){
  var currentPage='${currentPage}';
  function pageFor(href){
    if(!href)return null;
    // Los accesos de las tarjetas usan ../index.html?page=practice|tournament.
    // Leer primero el parámetro evita abrir otra copia del portal dentro del iframe.
    try {
      var targetPage=new URL(String(href),document.baseURI).searchParams.get('page');
      if(targetPage==='practice'||targetPage==='tournament'||targetPage==='match')return targetPage;
    } catch(_e) {}
    var clean=String(href).split('#')[0].split('?')[0].replace(/\\/g,'/');
    if(/torneo\/partido\.html$|(^|\/)partido\.html$/.test(clean))return 'match';
    if(/(^|\/)practica\/?$|(^|\/)practica\/index\.html$/.test(clean))return 'practice';
    if(/(^|\/)torneo\/?$|(^|\/)torneo\/index\.html$/.test(clean))return 'tournament';
    if(/^(\.\/)?index\.html$/.test(clean)){
      if(currentPage==='match')return 'tournament';
      if(currentPage==='practice')return 'practice';
      if(currentPage==='tournament')return 'tournament';
      return 'home';
    }
    if(clean==='.'||clean==='./'||clean==='..'||clean==='../'||clean==='/'||clean===''){
      if(clean==='..'||clean==='../'||clean==='/')return 'home';
      return currentPage==='home'?'home':null;
    }
    return null;
  }
  document.addEventListener('click',function(event){
    var anchor=event.target&&event.target.closest?event.target.closest('a[href]'):null;
    if(!anchor)return;
    var page=pageFor(anchor.getAttribute('href'));
    if(!page)return;
    event.preventDefault();parent.postMessage({type:'fu:navigate',page:page},'*');
  },true);
  parent.postMessage({type:'fu:ready',title:document.title},'*');
})();
</script>`;
  }
  function injectBeforeClosingTag(html, tag, content) {
    const index = html.toLowerCase().lastIndexOf(tag.toLowerCase());
    if (index < 0) return `${html}${content}`;
    return `${html.slice(0, index)}${content}\n${html.slice(index)}`;
  }
  function injectEnginePatch(html, report) {
    try { new Function(V96_ENGINE_PATCH); report.patches.push("sintaxis JavaScript v96 verificada"); }
    catch (error) { throw new Error(`La capa v96 no superó el control de sintaxis: ${String(error)}`); }
    // v97 es sólo visual: si no supera el control de sintaxis, el partido sigue funcionando con la vista v96.
    let visualPatch = "";
    try { new Function(V97_MATCH_PATCH); visualPatch = V97_MATCH_PATCH; report.patches.push("sintaxis JavaScript v97 (rediseño visual) verificada"); }
    catch (error) { report.warnings.push(`La capa visual v97 no superó el control de sintaxis y no se instaló: ${String(error)}`); }
    // v98 corrige estados imposibles del balón. Si no superara su control de sintaxis, sus parches de texto
    // quedan inactivos (comprueban que la función exista) y el partido sigue con el motor v96.
    let engineFixes = "";
    try { new Function(V98_ENGINE_FIXES); engineFixes = V98_ENGINE_FIXES; report.patches.push("sintaxis JavaScript v98 (correcciones del motor) verificada"); }
    catch (error) { report.warnings.push(`La capa v98 de correcciones del motor no superó el control de sintaxis y no se instaló: ${String(error)}`); }
    // Fase 1 de IA: simulación coherente. Si no superara el control de sintaxis, la CPU sigue con la de v96.
    let simCoherence = "";
    try { new Function(V98_SIM_COHERENCE); simCoherence = V98_SIM_COHERENCE; report.patches.push("sintaxis JavaScript v98 (simulación coherente) verificada"); }
    catch (error) { report.warnings.push(`La capa v98 de simulación coherente no superó el control de sintaxis y no se instaló: ${String(error)}`); }
    // Fase 2 de IA: decisiones de la CPU. Requiere la simulación coherente; sin ella, la CPU decide como en v96.
    let aiPatch = "";
    if (simCoherence) {
      try { new Function(V98_AI_PATCH); aiPatch = V98_AI_PATCH; report.patches.push("sintaxis JavaScript v98 (IA fase 2) verificada"); }
      catch (error) { report.warnings.push(`La capa v98 de IA no superó el control de sintaxis y no se instaló: ${String(error)}`); }
    }
    const finalIife = html.lastIndexOf("})();");
    if (finalIife < 0) { report.warnings.push("No se encontró el cierre del motor para instalar v96."); return html; }
    report.patches.push("motor táctico v96");
    if (engineFixes) report.patches.push("correcciones del motor v98");
    if (simCoherence) report.patches.push("simulación coherente de la CPU v98");
    if (aiPatch) report.patches.push("IA de la CPU v98 (fase 2)");
    if (visualPatch) { report.visualLayer = true; report.patches.push("rediseño visual del partido v97"); }
    return `${html.slice(0, finalIife)}\n${V96_ENGINE_PATCH}\n${engineFixes}\n${simCoherence}\n${aiPatch}\n${visualPatch}\n${html.slice(finalIife)}`;
  }
  async function loadGamePage(requestedPage) {
    const sourcePath = PAGE_PATHS[requestedPage];
    const enginePage = requestedPage === "practice" || requestedPage === "match";
    const report = { baselineCommit: BASELINE_COMMIT, sourcePath, enginePage, patches: [], warnings: [] };
    let html = await fetchOriginal(sourcePath);
    const expectedBlob = BASELINE_BLOBS[sourcePath];
    let actualBlob = null;
    try { actualBlob = await gitBlobSha1(html); }
    catch (error) { report.warnings.push(`No se pudo ejecutar la verificación SHA-1: ${String(error)}`); }
    if (actualBlob && actualBlob !== expectedBlob) report.warnings.push(`El contenido recibido no coincide con el blob protegido ${expectedBlob}.`);
    else if (actualBlob) report.patches.push("integridad SHA-1 de la base verificada");
    if (requestedPage === "tournament") html = patchTournamentCpuProfiles(html, report);
    html = patchInternalNavigation(html, report);
    html = patchEmbeddedLocation(html, report);
    if (enginePage) { html = patchSimulationParity(html, report); html = patchProgressiveActionResolution(html, report); html = patchShortPassLooseBall(html, report); html = patchSimulationFreeKick(html, report); html = injectEnginePatch(html, report); }
    const baseHref = new URL(`baseline/${PAGE_BASES[requestedPage]}`, BASE).href;
    html = injectBeforeClosingTag(html, "</head>", `<base href="${baseHref}"><style id="fu-v96-visual-layer">${enginePage ? V96_GAME_STYLES : V96_SHELL_STYLES}</style>`);
    // Estilos del rediseño v97: sólo en la pantalla de partido y sólo si su capa JS quedó instalada.
    if (enginePage && report.visualLayer) html = injectBeforeClosingTag(html, "</head>", `<style id="fu-v97-match-layer">${V97_MATCH_STYLES}</style>`);
    // La cabecera y navegación oficiales viven en la página contenedora.
    // Ocultar la cabecera propia de todas las páginas cargadas dentro del iframe
    // evita duplicar la navegación al entrar desde Inicio o desde el menú superior.
    if (requestedPage !== "home") {
      html = injectBeforeClosingTag(html, "</head>", `<style id="fu-single-navigation">
      /* Oculta la navegación del portal si la página de juego vuelve a incluirla.
         El selector anterior .topbar no coincidía con la clase real del encabezado. */
      .fu-shell-header, header.fu-shell-header, .fu-shell-nav { display: none !important; }
      .topbar, header.topbar { display: none !important; }
    </style>`);
    }
    html = injectBeforeClosingTag(html, "</body>", bridgeScript(requestedPage));
    html = html.replace(/<title>Fútbol Único · v95[^<]*<\/title>/g, "<title>Fútbol Único · Partido táctico</title>")
      .replace(/PRÁCTICA Y TORNEO v95/g, "Fútbol Único · Partido táctico")
      .replace(/Práctica v91/g, "Práctica libre");
    return { html, report };
  }
  function showStatus(kind, title, detail) {
    statusTitle.textContent = title;
    statusText.textContent = detail;
    statusDot.className = kind;
  }
  function updateNavigation() {
    document.querySelectorAll("[data-page]").forEach((button) => {
      const active = button.getAttribute("data-page") === page || (page === "match" && button.getAttribute("data-page") === "tournament");
      button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-current", "page"); else button.removeAttribute("aria-current");
    });
  }
  function navigate(next, tournamentQuery) {
    if (!PAGE_LABELS[next]) return;
    const url = new URL(window.location.href);
    url.search = "";
    if (tournamentQuery) new URLSearchParams(tournamentQuery).forEach((value,key) => url.searchParams.set(key,value));
    if (next !== "home") url.searchParams.set("page", next);
    window.history.pushState({}, "", url);
    page = next;
    loadAttempt++;
    renderPage();
  }
  function setLoading() {
    stage.setAttribute("aria-busy", "true");
    loading.hidden = false; errorPanel.hidden = true;
    loading.querySelector("strong").textContent = `Preparando ${PAGE_LABELS[page]}`;
    showStatus("loading", "Preparando juego", "Cargando la cancha.");
    if (activeIframe) activeIframe.remove(); activeIframe = null;
  }
  async function renderPage() {
    const attempt = loadAttempt;
    updateNavigation(); setLoading();
    try {
      const result = await loadGamePage(page);
      if (attempt !== loadAttempt) return;
      activeReport = result.report; latestAudit = null;
      activeIframe = document.createElement("iframe");
      activeIframe.className = "fu-game-frame";
      activeIframe.title = `Fútbol Único · ${PAGE_LABELS[page]}`;
      activeIframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups allow-modals");
      activeIframe.setAttribute("allow", "fullscreen"); activeIframe.allowFullscreen = true;
      activeIframe.srcdoc = result.html;
      activeIframe.addEventListener("load", () => {
        if (attempt !== loadAttempt) return;
        loading.hidden = true; errorPanel.hidden = true; stage.setAttribute("aria-busy", "false");
        showStatus("ready", "Juego listo", "Ya podés jugar.");
      }, { once: true });
      stage.appendChild(activeIframe);
    } catch (reason) {
      if (attempt !== loadAttempt) return;
      stage.setAttribute("aria-busy", "false"); loading.hidden = true; errorPanel.hidden = false;
      $("fuErrorText").textContent = reason instanceof Error ? reason.message : String(reason);
      showStatus("error", "Error de carga", "Revisá los archivos de publicación.");
    }
  }
  window.addEventListener("popstate", () => { page = pageFromUrl(); loadAttempt++; renderPage(); });
  window.addEventListener("message", (event) => {
    if (event.source !== activeIframe?.contentWindow || !event.data) return;
    if (event.data.type === "fu:audit" && event.data.report) {
      latestAudit = { passed: Number(event.data.report.passed) || 0, total: Number(event.data.report.total) || 0 };
      showStatus("ready", "Juego listo", "Ya podés jugar.");
      return;
    }
    if (event.data.type === "fu:navigate" && PAGE_LABELS[event.data.page]) navigate(event.data.page, typeof event.data.query === "string" ? event.data.query : undefined);
  });
  document.querySelectorAll("[data-page]").forEach((button) => button.addEventListener("click", () => navigate(button.getAttribute("data-page"))));
  $("fuBrand").addEventListener("click", () => navigate("home"));
  $("fuRetry").addEventListener("click", () => { loadAttempt++; renderPage(); });
  renderPage();
})();
