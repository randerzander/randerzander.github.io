# Why You Should Use

![](http://phoenix.apache.org/images/phoenix-logo-small.png)

# On HBase

This is the first in a series of articles about [Apache Phoenix](http://phoenix.apache.org/), using it, and optimizing your table definitions and queries.

For starters, read the overview about how it enhances [Apache HBase](http://hbase.apache.org/). If you're using either project it's worth your 10 minutes.

Before getting into numbers in the next article, why Phoenix at all? HBase is a high performance NoSQL key-value store. Why bother with a JDBC layer on top? Consider whether you have a clear, confident answer to ALL of the following questions:

1. [Do you have a key design guaranteeing your apps know key ranges for gets, multi-gets, or range-scans?](#1)
2. [Are your requirements well defined?](#2)
3. [Do you plan for apps to implement aggregations and transformations?](#3)
4. [Can you guarantee a random distribution of your keys?](#4)
5. [Do all your apps and all points of access run in a JVM?](#5)
6. [Are your dev teams comfortable using HBase's API?](#6)

**Hint:** the common theme is Phoenix is an intuitive abstraction over HBase's key/value semantics that preserves speed and scalability.

Still, let's dissect those questions one at a time:

### 1. Do you have a key design guaranteeing your apps know key ranges for gets, multi-gets, or range-scans?<a name="1" />

Perhaps Phoenix's greatest feature is [secondary indices](http://phoenix.apache.org/secondary_indexing.html), providing fast lookups without knowing row keys.

Consider a table `documents`, used to store business process documents for multiple customers. Each document is owned by a customer, was generated as part of a process, has a unique identifier (could be a filename), and actual contents:
```
CREATE TABLE IF NOT EXISTS documents(
  cust_id integer not null,
  process_id integer not null,
  doc_id integer not null,
  doc varchar,
  CONSTRAINT my_pk PRIMARY KEY (cust_id, process_id, doc_id)
);
```

Since `cust_id`, `process_id`, and `doc_id` make up the primary key (which IS the row-key), any query specifying those fields in a where clause is just a GET on a key, HBase's fastest possible access pattern:
```
>explain select * from documents where cust_id = 0 and process_id = 0 and doc_id = 0
PLAN
CLIENT 1-CHUNK SERIAL 1-WAY ROUND ROBIN POINT LOOKUP ON 1 KEY OVER DOCUMENTS
```

But if I don't specify `cust_id` in the where clause, the query will result in a full-scan, the *slowest* possible operation:
```
>explain select * from documents where process_id = 0 and doc_id = 0
PLAN
CLIENT 1-CHUNK PARALLEL 1-WAY ROUND ROBIN FULL SCAN OVER DOCUMENTS
    SERVER FILTER BY (PROCESS_ID = 0 AND DOC_ID = 0)
```

Note that even though I did supply *part* of my primary key, the lookup was a full scan. Phoenix only makes use of partial indices if they are supplied in the order of most significant bits. For example, when specifying a `cust_id` value but not `process_id` or `doc_id`, Phoenix is able to use the known key bits to limit the operation to a range-scan:
```
>explain select * from documents where cust_id = 0
PLAN
CLIENT 1-CHUNK SERIAL 1-WAY ROUND ROBIN RANGE SCAN OVER DOCUMENTS [0]
```

Suppose a customer calls my support line, and has a document ID, but doesn't know anything about their customer ID, or what business process is involved. Would looking that up for him be a full table scan? It doesn't have to be:
```
>CREATE INDEX IF NOT EXISTS doc_id_idx ON documents (doc_id) include (cust_id, process_id);
>explain select cust_id, process_id from documents where doc_id = 0
PLAN
CLIENT 1-CHUNK SERIAL 1-WAY ROUND ROBIN RANGE SCAN OVER DOC_ID_IDX [0]
    SERVER FILTER BY FIRST KEY ONLY
```

With one SQL statement, we've turned a query from a full-scan (BAD) into a range-scan (GOOD) over an indexed column.

Sadly, there's no such thing as a free lunch: every write to `documents` becomes *two* writes- one for data, & one for the index. You *could* implement this by hand, but you the app developer would be responsible for writing HBase client code to synchronize data and indices. To use the index, client apps would have to write code for reading and interpreting the index, and more code for issuing the appropriate range-scan of the data table. Phoenix's JDBC drivers handle all of this for you.

### 2. Are your requirements well defined?<a name="2" />

For any database, you should plan a physical model around access patterns. In reality, shifting, unknown, or poorly communicated requirements prevent that from happening. Phoenix's secondary inidices give you flexibility to deal with this at scale without requiring rework for client apps or for pipelines that dump results into HBase for fast access.

Stay tuned for the next article covering advanced secondary index performance tricks.

### 3. Do you plan for apps to implement aggregations and transformations?<a name="3" />

Key Value stores have fast IO, but typically have limited support for aggregations and user-defined functions, leaving users to repeatedly implement such logic in application code. Phoenix supports [common aggregates](http://phoenix.apache.org/language/functions.html) and [a UDF API](http://phoenix.apache.org/udf.html), reducing the amount of client-side code normally associated with NoSQL apps.

### 4. Can you can guarantee a random distribution of your keys?<a name="4" />

As a key/value store, HBase segments keys by ranges called "regions". Each RegionServer is responsible for hosting a set of regions. A frequently raised issue for HBase table design is keys having monotonically increasing values. For example, if your keys are timestamps, a high proportion of IO often hits the same region(s), overloading the RegionServer(s) hosting them. Called region hotspotting, it's the reason HBase has a bad rap for time-series data. To solve the problem, keys with non-random distributions are hashed or salted before writing or reading, yet one more non-trivial client-side responsibility.

To eliminate that burden, Phoenix admins can define ["salt buckets"](http://phoenix.apache.org/salted.html) in table DDLs. When Phoenix JDBC clients read or write, keys are automatically salted appropriately behind the scenes by the driver. This means that for many (most?) practical purposes, Phoenix lays the "HBase is bad for time-series" argument to rest.

### 5. Do all your apps and all points of access run in a JVM?<a name="5" />

HBase client drivers are only implemented fully for the JVM. Python & .Net implementations have appeared periodically, but are often out of date or expose limited subsets of HBase's Java API.

Phoenix also [can't yet expose some native HBase features](https://issues.apache.org/jira/browse/PHOENIX-590), but is making progress.

One major enhancement is Phoenix's [Query Server](http://phoenix.apache.org/server.html), which operates with Thrift or JSON serialization, so that [non-JVM](https://github.com/Boostport/avatica) [languages](https://pythonhosted.org/phoenixdb/) can communicate with it. [An ODBC driver](http://hortonworks.com/downloads/#addons) has been built for the Query Server; BI tools like MicroStrategy, Tableau, and Excel can issue queries against it.

The Query Server typically runs on an edge node, or co-located with HBase RegionServers, giving applications a single endpoint to hit instead of requiring network access to both ZooKeeper and the RegionServer processes. Put the Query Server behind a load balancer and you've got an HA front-end.

### 6. Are your dev teams comfortable using [HBase's API](https://hbase.apache.org/apidocs/)?<a name="6" />

To borrow [Julian Hyde](https://twitter.com/julianhyde)'s apt description, "I'm a SQL bigot". Without the JDBC abstraction Phoenix provides, I would never have tried HBase nor learned it's far faster than other OLTP solutions.

If you're comfortable with MySQL or Postgres, Phoenix will help you dip your toe in the Hadoop waters without diving immediately into a morass of Java. In fact, Phoenix's original creators at SalesForce.com explained they wanted to "give folks an API they already know", and to "reduce the amount of code users need to write" as primary motivations for putting SQL on top of HBase. They had many in-house SQL devs who didn't know HBase, but who wanted to use its speed and scalability.

Thus, Phoenix and [this](https://cdn.meme.am/instances/500x/37579492.jpg) wonderful meme were born.

## In Summary

Phoenix is a speed booster for HBase application development with mature, familiar interfaces and abstractions. If you're using HBase, you should probably also be using Phoenix.
