package com.lxk.model;

import com.google.common.collect.Lists;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.util.List;

/**
 * 流标签
 * Created by lxk on 2016/5/23.
 */
@Document(collection = "streamtag")
public class StreamTag implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * id
     */
    @Id
    private String id;

    /**
     * 名称
     */
    private String name;

    /**
     * 标签使用的流IDs
     */
    @Transient
    private List<String> streamIds = Lists.newArrayList();

    /**
     * 标签使用次数
     */
    @Transient
    private int useTimes;


    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getStreamIds() {
        return streamIds;
    }

    public void setStreamIds(List<String> streamIds) {
        this.streamIds = streamIds;
    }

    public int getUseTimes() {
        return useTimes;
    }

    public void setUseTimes(int useTimes) {
        this.useTimes = useTimes;
    }
}
