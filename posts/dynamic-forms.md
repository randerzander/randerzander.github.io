# Data-Driven Dynamic Forms in [Apache Zeppelin](https://zeppelin.apache.org/)

![](screenshots/zeppelin-forms/zeppelin-logo.jpg)

Apache Zeppelin is [all](https://blogs.apache.org/foundation/entry/the_apache_software_foundation_announces92) [the](http://www.datasciencecentral.com/profiles/blog/show?id=6448529%3ABlogPost%3A428213) [rage](http://www.slideshare.net/prasadwagle/zeppelin-at-twitter-62171116) [lately](http://schd.ws/hosted_files/apachebigdata2016/00/Everyone%20Plays-Collaborative%20Data%20Science%20with%20Zeppelin.pdf) and it's not hard to see why. Zeppelin has connectors for just about every popular big-data engine.

It's wonderful for those who write Scala, R, Python, or SQL, but that's not everyone. Fortunately, Zeppelin's UI is extensible with [custom](https://zeppelin.apache.org/docs/0.6.0-incubating-SNAPSHOT/manual/dynamicform.html) [forms](https://zeppelin.apache.org/docs/0.6.0-incubating-SNAPSHOT/displaysystem/table.html) and your favorite [HTML & JS libraries](https://zeppelin.apache.org/docs/0.6.0-incubating-SNAPSHOT/displaysystem/display.html#html)


Zeppelin's docs show how to add textboxes, checkboxes, and dropdown lists so readers can tweak queries without writing code. Let's take that capability beyond static values and instead automatically populate lists with data from tables:

<p data-gist-id="d56b5b675e3c9d46eae13335cb70fb36">

The snippet above provides 3 helper methods for getting..

1. Names of available tables

2. All columns names for a given table

3. All distinct values on a specific table and column

Lines 13 and beyond use them to solicit user input for a table name and the names of two columns. The selected values generate a query like:

```
select col1, col2, count(*) as count from table group by col1, col2 order by count desc
```

Zeppelin automatically runs the query and prints results in normal tabular form.

![](screenshots/zeppelin-forms/table-analyzer.png)

You can of course modify the snippet to generate queries of your own design and make more interesting use of Zeppelin's charts:

```
var query = """
select year, type, neighborhood, count(*) as count from (
  select split(rpt_date, "\\/")[2] as year, uc2_literal as type, neighborhood from crimes
  ) a
  where neighborhood = '"""
query = query + z.select("neighborhood", list("crimes", "neighborhood")) + "' group by year, type, neighborhood"

val df = sqlContext.sql(query)
println("%table " + df.columns.mkString("\t"))
println(df.map(x => x.mkString("\t")).collect().mkString("\n"))
```

![](screenshots/zeppelin-forms/Atlanta1.png)

A dynamically populated list of all of Atlanta's neighborhoods.

![](screenshots/zeppelin-forms/neighborhood-list.png)

The graphs update whenever the user selects a different value from the list.

![](screenshots/zeppelin-forms/Atlanta2.png)

Up-next.. how to use a better, more flexible [query builder](http://querybuilder.js.org/demo.html)!
