package com.lxk.vo;

import com.google.common.base.MoreObjects;

/**
 * @author wei.Li
 */
public class ReportSettingCountVO {

    /**
     * 报表任务 id
     */
    private String reportSettingId;
    /**
     * 该报表任务下生成报表文件数量
     */
    private int count;

    public String getReportSettingId() {
        return reportSettingId;
    }

    public void setReportSettingId(String reportSettingId) {
        this.reportSettingId = reportSettingId;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    @Override
    public String toString() {
        return MoreObjects.toStringHelper(this)
                .add("reportSettingId", reportSettingId)
                .add("count", count)
                .toString();
    }
}
