# readme

[Spring aop 自定义注解 例子](https://blog.csdn.net/qq_27093465/article/details/78800100?tdsourcetag=s_pctim_aiomsg)


编译


`
mvn clean install -Dmaven.test.skip=true
`

[访问](http://localhost:8101/SpringMVC/student/getAllStudent)

产生
```shell

Around method                start.......................
Around method                methodLog 的参数，remark：查询-方法名称getAllStudent   clazz：class com.lxk.model.Student
before method                start ...
before method description：查询-方法名称getAllStudent   clazz：class com.lxk.model.Student
before method                end ...
2019-07-04 17:37:31,068 INFO : org.mongodb.driver.connection - Opened connection [connectionId{localValue:2, serverValue:4}] to 127.0.0.1:27017
Around method                返回结果：[]
Around method                end.......................
After method                start.......................
After method                methodLog 的参数，remark：查询-方法名称getAllStudent   clazz：class com.lxk.model.Student
After method                end.......................
AfterReturning method               start.......................
AfterReturning method               返回的结果：[]
AfterReturning method               end.......................
```