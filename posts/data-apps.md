![](screenshots/data-apps/prototypes.png)

Zeppelin is usually described as a "data science notebook for exploration and analysis" which fits common usage, but seems limiting.

Analytics are valuable by themselves, but they raise the "so what?" question. "Data says X, but how are we going to expose that to employees so they can work smarter?"

Frequently, the answer is to hack together a Python or NodeJS app to expose [Apache Hive](http://hive.apache.org/) tables, [Apache Spark](http://spark.apache.org/) jobs, or streaming outputs from [Apache Storm](http://storm.apache.org/) or [Apache NiFi](http://nifi.apache.org/).

That's fine when there are spare ports and servers to share with end-users. But, right, wrong, or otherwise, enterprises often discourage (or disallow) teams from running and exposing their own web-apps.

There's good news! If you're running [HDP](http://hortonworks.com/products/data-center/hdp/), you've got Zeppelin, whose array of [interpreter backends](https://zeppelin.apache.org/docs/0.6.1/#multiple-language-backend) makes it easy to access to your data in a web context.

In addition to its long list of data-access interpreters, Zeppelin has an [AngularJS interpreter](https://zeppelin.apache.org/docs/0.6.1/displaysystem/front-end-angular.html). With that, it's a snap to both [add custom user interfaces](https://zeppelin.apache.org/docs/0.6.1/manual/dynamicform.html) and to include and use external HMTL, JS, and CSS assets like [BootStrap](http://getbootstrap.com/), [Plotly](https://plot.ly/javascript/):

![](screenshots/data-apps/plotlyjs.png)

[HighCharts](http://www.highcharts.com/) etc:

![](screenshots/data-apps/highcharts.png)

Given the ability to include arbitrary web assets & combine them with Angular linked to a secured backend Spark context, Zeppelin simplifies prototype app dev. No need to seek approval to install NodeJS or open new ports. Instead, get to users faster by focusing on the data and the UI you're putting on top.

Consider..

## An Embarassingly Common Use Case

Your web-app generates precious logs for every click. Business units are interested in activity spikes but hate grepping logs and *really* hate playing e-mail ping-pong with analysts to tweak time-periods in reports.

Ok, let's give *them* the power and responsibility: a simple interface driven by a few queries they keep wanting you to re-run, and a chart with selectable time bounds:

![](screenshots/data-apps/simple-app.gif)

We just created a one-stop dashboard for:
1. High level activity tracking (web activity graph)
2. Overall health (HTTP code pi chart)
3. Who's scraping my pages (scatter plot of traffic sources)
4. Which areas of my site are most popular (bar graph)
5. A log viewer

All of these driven by the same user-selected time-bounds. And, look, ma! No SQL (no, not HBase, MongoDB, or Cassandra)!

Ok, drill-downs have been around since the 90s, so this example isn't the pinnacle of UI achievements.

But, with the ever-growing list of [JS graphing libraries](http://www.jsgraphs.com/), and the wealth of Zeppelin Interpreters, you can now easily stick your big-data in pretty webpages, give users a more friendly interface and can stop flashing your Matrix themed terminal during meetings.

## Now How Do I Do That?

With those thoughts in mind, here are a few examples and tips which may help you:

Zeppelin's front-end Angular API exposes variables set from the backend to custom JavaScript, but only in the context of a callback:
<p data-gist-id="6fec0ff8601bdd6bd25bbefe0847b2d5" data-gist-file="simple.html">

![](screenshots/data-apps/simple.gif)

This is fine if you only need to access one variable at a time, but it makes interacting with multiple Angular vars difficult.

After some tinkering, I settled on the following approach:

First, define variables you want to expose, and a helper JS function 'hoist' which binds those variables to a globally accessible object, window.angularVars:
<p data-gist-id="6fec0ff8601bdd6bd25bbefe0847b2d5" data-gist-file="hoist.html">

Next, set those variables in Spark:
<p data-gist-id="6fec0ff8601bdd6bd25bbefe0847b2d5" data-gist-file="setVars.scala">

Note that when using this "hoist" approach, if you want your paragraph to automatically update, you need to use z.run("myParagraphId") after setting your Spark variables. This is because the 'hoist' callback only updates the window.angularVar values and doesn't make any assumptions about when you want to re-run your downstream Angular paragraphs.

Now you can update multiple variables on the Spark backend, and any Angular paragraphs can use as many or as few of the window.angularVars as needed without wrapping themselves in callback hell:
<p data-gist-id="6fec0ff8601bdd6bd25bbefe0847b2d5" data-gist-file="myAppDiv.html">

![](screenshots/data-apps/hoist.gif)

But sometimes, you want to interact with that data in JS and pass it back to Zeppelin. To do that, setup your SparkContext variables and callback:

<p data-gist-id="6fec0ff8601bdd6bd25bbefe0847b2d5" data-gist-file="setup.scala">

On the front-end, you can access the Angular variables, mess with them, and pass back modified values without letting the user manually edit them.

<p data-gist-id="6fec0ff8601bdd6bd25bbefe0847b2d5" data-gist-file="front.html">

![](screenshots/data-apps/front-to-back.gif)

## Putting it All Together

The SimpleApp notebook that was behind the demo gif above is available [here](https://gist.githubusercontent.com/randerzander/9c2eee67abc3534390b2b1b0d13d48c6/raw/c22f734108d128dcc540d3e992ba7142bc8ffecb/SimpleApp.json). You'll have to save it as a JSON file then import it through Zeppelin's homepage:

![](screenshots/data-apps/import.png)

In the first paragraph I include the 'hoist' snippet and include Plotly as a JS script.

Next, download some sample data from NASA:

<p data-gist-id="6fec0ff8601bdd6bd25bbefe0847b2d5" data-gist-file="get-data.sh">

Parse it into a table:

<p data-gist-id="6fec0ff8601bdd6bd25bbefe0847b2d5" data-gist-file="parse.scala">

Then setup your queries and Angular watcher callbacks:

<p data-gist-id="6fec0ff8601bdd6bd25bbefe0847b2d5" data-gist-file="queries.scala">

Create an Angular paragraph which reads the query results from window.angularVars.data and window.angularVars.dataSchema.

As you can see, from the length of this snippet, setting up variables for JS charts is not super fun so it's worth putting effort into re-usable patterns where possible. This is why I stick axis names, Angular variable names, and other config items into the chart div's HTML attributes. Those are easier to edit and tweak than JS itself.

<p data-gist-id="6fec0ff8601bdd6bd25bbefe0847b2d5" data-gist-file="graph.js">

Lastly for this example, add your auto-refreshing downstream charts and tables, making sure to copy their IDs into the "refresh" attribute of the #chart div in the Plotly graph paragraph.

Now, kudos and big bonus points are available to whoever integrates [StarMap](http://timechart.toolset.io/) with their data!
