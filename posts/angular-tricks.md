![](screenshots/angular-tricks/prototypes.png)

Zeppelin is usually described as a "data science notebook for exploration and analysis" which fits common usage, but seems limiting.

Analytics are valuable by themselves, but they raise the "so what?" question. "Data says X, but how are we going to expose that to employees so they can work smarter?"

Frequently, the answer is to hack together a Python or NodeJS app to expose [Apache Hive](http://hive.apache.org/) tables, [Apache Spark](http://spark.apache.org/) jobs, or streaming outputs from [Apache Storm](http://storm.apache.org/) or [Apache NiFi](http://nifi.apache.org/).

That's fine when there are spare ports and servers to share with end-users. But, right, wrong, or otherwise, enterprises often discourage (or disallow) teams from running and exposing their own web-apps.

There's good news! If you're running [HDP](http://hortonworks.com/products/data-center/hdp/), you've got Zeppelin, whose array of [interpreter backends](https://zeppelin.apache.org/docs/0.6.1/#multiple-language-backend) makes it easy to access to your data in a web context.

In addition to its long list of data-access interpreters, Zeppelin has an [AngularJS interpreter](https://zeppelin.apache.org/docs/0.6.1/displaysystem/front-end-angular.html). With that, it's a snap to both [add custom user interfaces](https://zeppelin.apache.org/docs/0.6.1/manual/dynamicform.html) and to include and use external HMTL, JS, and CSS assets like [BootStrap](http://getbootstrap.com/), [Plotly](https://plot.ly/javascript/):

![](screenshots/angular-tricks/plotlyjs.png)

[HighCharts](http://www.highcharts.com/) etc:

![](screenshots/angular-tricks/highcharts.png)

Given the ability to include arbitrary web assets & combine them with Angular linked to a secured backend Spark context, Zeppelin simplifies prototype app dev. No need to seek approval to install NodeJS or open new ports. Instead, get to users faster by focusing on the data and the UI you're putting on top.

With those thoughts in mind, there are a few tricks and examples which may help you:

Zeppelin's front-end Angular API exposes variables set from the backend to custom JavaScript, but only in the context of a callback:
<p data-gist-id="6fec0ff8601bdd6bd25bbefe0847b2d5" data-gist-file="simple.html">

![](screenshots/angular-tricks/simple.gif)

This is fine if you only need to access one variable at a time, but it makes interacting with multiple Angular vars difficult.

After some tinkering, I settled on the following approach:

First, define variables you want to expose, and a helper JS function 'hoist' which binds those variables to a globally accessible object, window.angularVars:
<p data-gist-id="6fec0ff8601bdd6bd25bbefe0847b2d5" data-gist-file="hoist.html">

Next, set those variables in Spark:
<p data-gist-id="6fec0ff8601bdd6bd25bbefe0847b2d5" data-gist-file="setVars.scala">

Note that when using this "hoist" approach, if you want your paragraph to automatically update, you need to use z.run("myParagraphId") after setting your Spark variables. This is because the 'hoist' callback only updates the window.angularVar values and doesn't make any assumptions about when you want to re-run your downstream Angular paragraphs.

Now any other Angular paragraphs can use any of the window.angularVars as needed:
<p data-gist-id="6fec0ff8601bdd6bd25bbefe0847b2d5" data-gist-file="myAppDiv.html">

![](screenshots/angular-tricks/hoist.gif)

Great! But sometimes, you want to interact with that data in JS and pass it back to Zeppelin. To do that, make use of hidden input forms:

