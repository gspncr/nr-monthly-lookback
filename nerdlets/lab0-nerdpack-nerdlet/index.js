import React from 'react';
import {BarChart, NerdGraphQuery, EntityByGuidQuery, EntitiesByNameQuery, EntitiesByDomainTypeQuery, EntityCountQuery, Spinner, Stack, StackItem, HeadingText, BlockText, NerdletStateContext, PieChart, NrqlQuery, LineChart, BillboardChart, AreaChart, AccountPicker } from 'nr1'

// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

export default class Lab0NerdpackNerdletNerdlet extends React.Component {
    
    constructor(props) {
        super(props);
        this.accountId = null;
        this.state = {
            entityGuid: null,
            appName: null
        };
        
        this.openEntity = this.openEntity.bind(this);
        this.onChangeAccount = this.onChangeAccount.bind(this);
        //console.debug("Nerdlet constructor", this); //eslint-disable-line
    }

    onChangeAccount(value) {
        //alert(`Selected account: ${value}`);

        this.setState({ accountId: value });
    }

    setApplication(inAppId, inAppName) {
        this.setState({ entityGuid: inAppId, appName: inAppName })
    }

    openEntity() {
        const { entityGuid, appName } = this.state;
        nerdlet.setUrlState({ entityGuid, appName });
        navigation.openEntity(entityGuid);
    }

    getLastMonth(){
        const monthNames = ["December", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November"];
        const d = new Date();
        return (monthNames[d.getMonth()]);
    }

    getNRQuery(nrqlquery){
        const id = this.state.accountId;
        let query = `{ 
                actor { 
                    account(id:` + id + `) { 
                        NRQL: nrql(query: "` + nrqlquery +  `") { results }  
                    } 
                } 
            }`
        return query
    }

    render() {
        return <p> 
        <NerdGraphQuery query={`{actor {user {name email}}}`}>
                    {({loading, error, data}) => {
                        /*console.debug([loading, data, error]); //eslint-disable-line
                        console.debug([data][0].actor.user.name)
                        console.debug(this.getLastMonth()); */
                        document.getElementById('output').innerHTML = "Welcome "+([data][0].actor.user.name) + "!";
                        document.getElementById('title').innerHTML = "Here is your " + this.getLastMonth() + " in New Relic";
                        return null
                    }}
        </NerdGraphQuery>
        
        <p id="output"></p>
        <h1 id="title"></h1>
        <div class="account-picker"><AccountPicker
                value={this.state.accountId}
                onChange={this.onChangeAccount}
            /></div>

        <div class="card">
            <p id="cardHead"><h3>Most Transactions 📈</h3></p>
            <p id="cardBody result1"><i>Pick an account</i></p>
            <NrqlQuery pollInterval={2000} accountId={ this.state.accountId } query="SELECT count(*) FROM Transaction SINCE last month until this month TIMESERIES AUTO limit 1 FACET appName ">
                {({ data }) => {
                    return <LineChart data={data} />;
                }}
            </NrqlQuery>

            <NerdGraphQuery query= {this.getNRQuery("SELECT count(*) FROM Transaction SINCE last month until this month")} >
            {({loading, error, data}) => {
                //console.debug([loading, data, error]); //eslint-disable-line
                //console.debug([[data][0].actor.account.NRQL.results[0].count]);
                document.getElementById('cardBody result1').innerHTML = "Total Transactions: " + ([[data][0].actor.account.NRQL.results[0].count]);
                return null
            }}
            </NerdGraphQuery>
        </div>

        <div class="card">
            <p id="cardHead"><h3>Most JavaScript Errors 💩</h3></p>
            <p id="cardBody result2"><i>Pick an account</i></p>
            <BillboardChart
                accountId={this.state.accountId}
                query='SELECT count(*) from JavaScriptError since last month until this month limit 1 facet appName '
            />
            <NerdGraphQuery query= {this.getNRQuery("SELECT count(*) from JavaScriptError since last month until this month limit 1")} >
            {({loading, error, data}) => {
                //console.debug([loading, data, error]); //eslint-disable-line
                //console.debug([[data][0].actor.account.NRQL.results[0].count]);
                document.getElementById('cardBody result2').innerHTML = "Total JS Errors: " + ([[data][0].actor.account.NRQL.results[0].count]);
                return null
            }}
            </NerdGraphQuery>
        </div>

        <div class="card">
            <p id="cardHead"><h3>Most Available Monitor 🥰</h3></p>
            <p id="cardBody result3"><i>Pick an account</i></p>
            <AreaChart
                accountId={this.state.accountId}
                query="SELECT percentage(count(*), where result = 'SUCCESS') from SyntheticCheck since last month until this month limit 1 facet monitorName  TIMESERIES AUTO"
            />
            <NerdGraphQuery query= {this.getNRQuery("SELECT percentage(count(*), where result = 'SUCCESS') from SyntheticCheck since last month until this month limit 1 facet monitorName")} >
            {({loading, error, data}) => {
                //console.debug([loading, data, error]); //eslint-disable-line
                //console.debug([[data][0].actor.account.NRQL.results[0].count]);
                document.getElementById('cardBody result3').innerHTML = "Availability: " + (Math.round(([[data][0].actor.account.NRQL.results[0].percentage])*100)/100) + "%";
                return null
            }}
            </NerdGraphQuery>
        </div>
        
        <div class="card">
            <p id="cardHead"><h3>Longest Transaction Duration 🥵</h3></p>
            <p id="cardBody result4"><i>Pick an account</i></p>
            <NrqlQuery accountId={this.state.accountId} query="SELECT average(duration) FROM Transaction FACET appName since last month until this month timeseries auto limit 1">
                {({ data }) => {
                    if (data) {
                        // change colors to a nice pink.
                        data.forEach(({metadata}) => metadata.color = '#F00BA5');
                    }
                    return <LineChart data={data} />;
                    
                }}
            </NrqlQuery>
            <NerdGraphQuery query= {this.getNRQuery("SELECT average(duration) as 'av' FROM Transaction since last month until this month limit 1")} >
            {({loading, error, data}) => {
                //console.debug([loading, data, error]); //eslint-disable-line
                //console.debug("avg ",[[data][0].actor.account.NRQL.results[0].av]);
                document.getElementById('cardBody result4').innerHTML = "Average Duration: " + ([[data][0].actor.account.NRQL.results[0].av.toFixed(3)]) + " S";
                return null
            }}
            </NerdGraphQuery>
        </div>

        <div class="card">
            <p id="cardHead"><h3>Apps Monitored 🏆</h3></p>
            <p id="cardBody result5"><i>Pick an account</i></p>
            <BillboardChart
                accountId={this.state.accountId}
                query="SELECT uniqueCount(appName) as 'Apps Monitored' FROM Transaction, PageView  SINCE last month until this month"
            />
            <NerdGraphQuery query= {this.getNRQuery("SELECT uniqueCount(appName) as 'apps' FROM Transaction, PageView SINCE last month until this month")} >
            {({loading, error, data}) => {
                //console.debug([loading, data, error]); //eslint-disable-line
                //console.debug([[data][0].actor.account.NRQL.results[0].count]);
                document.getElementById('cardBody result5').innerHTML = "Unique Browser and APM apps: " + ([[data][0].actor.account.NRQL.results[0].apps]);
                return null
            }}
            </NerdGraphQuery>
        </div>
        
        <div class="card">
            <p id="cardHead"><h3>Cities visiting 🌎</h3></p>
            <p id="cardBody result6"><i>Pick an account</i></p>
            <BarChart
                accountId={this.state.accountId}
                query='SELECT count(*) FROM PageView, MobileSession, JavaScriptError SINCE last month until this month facet city limit 50'
            />
            <NerdGraphQuery query= {this.getNRQuery("SELECT uniqueCount(city) as 'city' FROM PageView, PageAction, BrowserInteraction, AjaxRequest, BrowserTiming, MobileSession, PageViewTiming, JavaScriptError  SINCE last month until this month")} >
            {({loading, error, data}) => {
                //console.debug([loading, data, error]); //eslint-disable-line
                //console.debug([[data][0].actor.account.NRQL.results[0].count]);
                document.getElementById('cardBody result6').innerHTML = "Number of cities you received visits from: " + ([[data][0].actor.account.NRQL.results[0].city]);
                return null
            }}
            </NerdGraphQuery>
        </div>

        <div class="card">
            <p id="cardHead"><h3>Device Types 📱</h3></p>
            <p id="cardBody result7"><i>Pick an account</i></p>
            <AreaChart
                accountId={this.state.accountId}
                query="from PageView, BrowserInteraction SELECT count(*) facet deviceType since last month until this month timeseries auto"
            />
            <NerdGraphQuery query= {this.getNRQuery("from PageView, BrowserInteraction SELECT uniqueCount(deviceType) as 'views' facet deviceType since last month until this month")} >
            {({loading, error, data}) => {
                //console.debug([loading, data, error]); //eslint-disable-line
                //console.debug([[data][0].actor.account.NRQL.results[0].count]);
                document.getElementById('cardBody result7').innerHTML = "Types of devices: " + ([[data][0].actor.account.NRQL.results[0].views]);
                return null
            }}
            </NerdGraphQuery>
        </div>

        <div class="card">
            <p id="cardHead"><h3>Frustrated Requests 🤬</h3></p>
            <p id="cardBody result8"><i>Pick an account</i></p>
            <AreaChart
                accountId={this.state.accountId}
                query="SELECT count(*) FROM Transaction where nr.apdexPerfZone = 'F' since last month until this month timeseries auto facet appName"
            />
            <NerdGraphQuery query= {this.getNRQuery("SELECT count(*) FROM Transaction where nr.apdexPerfZone = 'F' since last month until this month")} >
            {({loading, error, data}) => {
                //console.debug([loading, data, error]); //eslint-disable-line
                //console.debug([[data][0].actor.account.NRQL.results[0].count]);
                document.getElementById('cardBody result8').innerHTML = "Frustrated Requests: " + ([[data][0].actor.account.NRQL.results[0].count]);
                return null
            }}
            </NerdGraphQuery>
        </div>

        <div class="card">
            <p id="cardHead"><h3>Most Popular OS 🤓</h3></p>
            <p id="cardBody result9"><i>Pick an account</i></p>
            <BarChart
                accountId={this.state.accountId}
                query="SELECT count(*) FROM PageView since last month until this month FACET  userAgentOS"
            />
            <NerdGraphQuery query= {this.getNRQuery("SELECT count(userAgentOS) FROM PageView since last month until this month FACET  userAgentOS limit 1")} >
            {({loading, error, data}) => {
                //console.debug([loading, data, error]); //eslint-disable-line
                //console.debug([[data][0].actor.account.NRQL.results[0]]);
                document.getElementById('cardBody result9').innerHTML = "Most popular OS: " + ([[data][0].actor.account.NRQL.results[0].userAgentOS]);
                return null
            }}
            </NerdGraphQuery>
        </div>

        <div class="card">
            <p id="cardHead"><h3>Most Used Browser 🖥</h3></p>
            <p id="cardBody result10"><i>Pick an account</i></p>
            <BarChart
                accountId={this.state.accountId}
                query="SELECT count(*) FROM PageView since last month until this month FACET  userAgentName limit 20 "
            />
            <NerdGraphQuery query= {this.getNRQuery("SELECT count(*) FROM PageView since last month until this month FACET  userAgentName ")} >
            {({loading, error, data}) => {
                //console.debug([loading, data, error]); //eslint-disable-line
                //console.debug([[data][0].actor.account.NRQL.results[0]]);
                document.getElementById('cardBody result10').innerHTML = "Most popular web browser: " + ([[data][0].actor.account.NRQL.results[0].userAgentName]);
                return null
            }}
            </NerdGraphQuery>
        </div>

        </p>;
    }
}
