let text = `Student sharing = Student Collaboration,Student engagement
Q of Improvement Plan = Community Input,Competing priorities
Empowerment of teachers = Coaching,Psychological safety
Coaching = Needs Assessment
Student Trust = Student sharing
Skills Building = Teacher conferencing
Competing priorities = Leadership team turnover
Needs Assessment = Confident to take risks
Teacher conferencing = Teacher Scanning
Student Collaboration = Skills Building,Student engagement,Student Trust
Teacher Scanning = Student Collaboration
Q of support & coaching = Ability to influence others,Funding Support,Q of school systems & structures,Staff expertise
Student achievement = Enthusiasm,Student sharing,Student engagement
Collective Teacher Efficacy = Celebrating success,Empowerment of teachers,Innovation in pedagogy,Staff expertise
Innovation in pedagogy = Empowered Learners,Empowerment of teachers,Confident to take risks,Q of school systems & structures,Q of support & coaching
Funding Support = Student achievement
Student engagement = Celebrating success,Staff engagement
Empowered Learners = Shared Purpose
Psychological safety = Shared Purpose,Trust in team
Community Engagment = Q of Improvement Plan
Community Input = Community Engagment
Regular sharing amongst teams = Deep Listening,Q of school systems & structures,Trust in team
Staff engagement = Collective Teacher Efficacy,Confident to take risks,Student engagement
Confident to take risks = Empowerment of teachers,Shared Purpose
Q of school systems & structures = Q of Improvement Plan
Shared Purpose = Innovation in pedagogy,Trust in team
Staff expertise = Innovation in pedagogy
Ability to influence others = Leaders as Learners
Celebrating success = Student achievement
Deep Listening = Regular sharing amongst teams
Enthusiasm = Regular sharing amongst teams,Staff engagement,Student engagement
Leaders as Learners = Trust in team
Leadership team turnover = Trust in team
Trust in team = Deep Listening,Regular sharing amongst teams,Unity of leadership team
Unity of leadership team = Leadership team turnover`
text = text.replace(/Q /g,'Quality ')

export let model = {} // variable => {upstream:[], downstream[]}
for (let line of text.split(/\n/)) {
  let [variable, dependents] = line.split(/ = /)
  let upstream = dependents.split(/,/)
  model[variable] ||= {upstream:[], downstream:[]}
  model[variable].upstream = upstream
  for (let dependent of upstream) {
    model[dependent] ||= {upstream:[], downstream:[]}
    model[dependent].downstream.push(variable)
  }
}

