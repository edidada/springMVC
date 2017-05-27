package com.lxk.model;

import com.google.common.base.Objects;
import lombok.Data;

import java.util.Date;

/**
 * 博客的指标信息（每天都会变的信息）
 * <p>
 * Created by lxk on 2017/5/25
 */
@Data
public class BlogIndex {
    /**
     * 统计数据时的日期
     */
    private Date date;
    /**
     * 评论
     */
    private Integer ping;
    /**
     * 阅读次数，或者叫文章点击数
     */
    private Integer read;
    /**
     * 顶的个数
     */
    private Integer praise;
    /**
     * 踩的个数
     */
    private Integer tread;

    /**
     * 同一篇博客的指标由这几个属性决定，若相同，则不需要重复添加。
     */
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BlogIndex)) return false;
        BlogIndex blogIndex = (BlogIndex) o;
        return Objects.equal(getDate(), blogIndex.getDate())
                && Objects.equal(getPing(), blogIndex.getPing())
                && Objects.equal(getRead(), blogIndex.getRead())
                && Objects.equal(getPraise(), blogIndex.getPraise())
                && Objects.equal(getTread(), blogIndex.getTread());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(
                getDate(),
                getPing(),
                getRead(),
                getPraise(),
                getTread());
    }

}
