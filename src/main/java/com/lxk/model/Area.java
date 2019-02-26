package com.lxk.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

/**
 * 区域表，目前只有NPM使用
 * @author Johnson
 *
 */
@Document(collection = "area")
public class Area {

    @Id
    private String id;

    /**
     * 区域名称
     */
    private String areaName;

    /**
     * 计算流量的流
     */
    private List<String> streamIds;

    /**
     * 包含的网络路径（链路）
     */
    private List<String> topoIds;

    /**
     * 是否展示
     */
    private boolean is_show = true;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAreaName() {
        return areaName;
    }

    public void setAreaName(String areaName) {
        this.areaName = areaName;
    }

    public List<String> getStreamIds() {
        return streamIds;
    }

    public void setStreamIds(List<String> streamIds) {
        this.streamIds = streamIds;
    }

    public List<String> getTopoIds() {
        return topoIds;
    }

    public void setTopoIds(List<String> topoIds) {
        this.topoIds = topoIds;
    }

    public boolean isIs_show() {
        return is_show;
    }

    public void setIs_show(boolean is_show) {
        this.is_show = is_show;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Area)) return false;

        Area area = (Area) o;

        return id != null ? id.equals(area.id) : area.id == null;
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}
