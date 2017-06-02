package com.lxk.model;

import com.google.common.base.Objects;
import com.google.common.collect.Sets;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;
import java.util.Set;

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
    /**
     * 增长数量
     */
    public static final String INCREASE = "increase";
    public static final String PRAISE = "praise";
    public static final String TREAD = "tread";

    @Id
    private String id;
    /**
     * 文章标题
     */
    private String title;
    /**
     * 文章发布日期
     */
    private Date createTime;
    /**
     * 文章在CSDN网站的ID（可使用它生成文章的URL）
     */
    private String articleId;
    /**
     * 评论(记录最新一次)
     */
    private int ping;
    /**
     * 阅读次数，或者叫文章点击数(记录最新一次)
     */
    private int read;
    /**
     * 顶的个数(记录最新一次)
     */
    private int praise;
    /**
     * 踩的个数(记录最新一次)
     */
    private int tread;
    /**
     * 文章所在类别（同一篇文章可属于多个类别）
     */
    private List<String> category;
    /**
     * 一篇博客的指标信息集合
     */
    private Set<BlogIndex> blogIndexSet = Sets.newHashSet();
    /**
     * 增长数量
     */
    @Transient
    private Integer increase = 0;
    /**
     * url：/qq_27093465/article/details/71440085
     */
    private String href;


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
