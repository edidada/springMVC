package com.lxk.model;

import com.google.common.base.Objects;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

/**
 * 博客
 * <p>
 * Created by lxk on 2017/5/17
 */
@Data
//@NoArgsConstructor//无参构造函数
//@AllArgsConstructor//全部参数构造函数，包括id在内
@Document(collection = "blog")
public class Blog {
    private static final long serialVersionUID = 1L;
    /**
     * 点击次数
     */
    public static final String READ = "read";
    /**
     * 评论次数
     */
    public static final String PING = "ping";

    @Id
    private String id;
    /**
     * 文章标题
     */
    private String title;
    /**
     * 评论
     */
    private Integer ping;
    /**
     * 阅读次数，或者叫文章点击数
     */
    private Integer read;
    /**
     * 文章所在类别（同一篇文章可属于多个类别）
     */
    private List<String> category;
    /**
     * 文章发布日期
     */
    private Date createTime;
    /**
     * 顶的个数
     */
    private Integer praise;
    /**
     * 踩的个数
     */
    private Integer tread;
    /**
     * 文章在CSDN网站的ID（可使用它生成文章的URL）
     */
    private String articleId;


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Blog)) return false;
        Blog stream = (Blog) o;
        return Objects.equal(getId(), stream.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

}
