# QueryBuilder UI in [Apache Zeppelin](https://zeppelin.apache.org/)

![](screenshots/zeppelin-forms/zeppelin-logo.jpg)

In the last post we demonstrated using basic HTML forms to allow end-users to tweak SparkSQL queries. Now we'll make it prettier thanks to the open source [JQuery QueryBuilder plugin](http://querybuilder.js.org/).

First we setup a few variables in Spark.

<p data-gist-id="f447378c03738cf78b2bea270ca9a8ee" data-gist-file="cell1.scala">

Building on the snippet from the last post, I've added a wrapper for printing DataFrames as tables.

Line 25 tells Spark to listen for changes to "clause" originating from the notebook front-end. The value of "query" gets updated each time.

Next we use the %angular interpreter with a few CSS and JS artifacts loaded from [GitHub](https://github.com/mistic100/jQuery-QueryBuilder) by [RawGit](https://rawgit.com/). A bit of JavaScript handles populating QueryBuilder's filter list from Spark.

<p data-gist-id="f447378c03738cf78b2bea270ca9a8ee" data-gist-file="cell2.html">

Lastly we have a third cell for displaying query results:

<p data-gist-id="f447378c03738cf78b2bea270ca9a8ee" data-gist-file="cell3.scala">

Users can then work with an intuitive interface for customizing a where clause. On clicking "Generate Query" and then "Run Query", Zeppelin automatically updates the query, runs it, and prints results as a table.

![](screenshots/zeppelin-qb/qb.gif)

You can modify the snippets to perform different queries and tweak the UI.

Unfortunately, QueryBuilder only allows for filter rules, and *not* specific columns or aggregate functions. Hit me up on [Twitter](https://twitter.com/randerzander) or [GitHub](https://github.com/randerzander) if you know how to do that!
