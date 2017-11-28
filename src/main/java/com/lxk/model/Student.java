package com.lxk.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;

/**
 * Created by lxk on 2017/3/27
 */
@Document(collection = "student")
@Data
public class Student implements Serializable {

    /**
     * 这个ID一般没啥特别的要求，就设置为1L就可以啦。没必要自己随便去实现个long数字
     */
    private static final long serialVersionUID = 1L;
    @Id
    private String id;
    private String name;
    private int age;
    private boolean sex;
    /**
     * 这个就 被数据库保存，估计和mongo的注解实现有关系。
     */
    @Transient
    private Integer money;

    /**
     * 在属性前加上transient还是会被保存到数据库的
     */
    transient private Integer floor;


    public Student() {
    }

    public Student(String name, int age, boolean sex) {
        this.name = name;
        this.age = age;
        this.sex = sex;
    }


    @Override
    public String toString() {
        return "Student{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", age=" + age +
                ", sex=" + sex +
                ", money=" + money +
                ", floor=" + floor +
                '}';
    }
}
