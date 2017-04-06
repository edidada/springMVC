package com.lxk.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Properties;
import java.util.PropertyResourceBundle;

public class LoadProperties {
	private static final Logger LOG = LoggerFactory.getLogger(LoadProperties.class);
	public static String getPath(){
		String path = System.getProperty("user.dir");
		LOG.debug("user.dir path:" + path);
		if(path.lastIndexOf("bin") != -1)
			path = path.substring(0, path.lastIndexOf("bin")) + "conf/lxk";
		else
			path = path + "/conf";
		
		LOG.debug("substring user.dir path:" + path);
		return path;
	}
	
	
	public static void load(String fileName, Properties props) {
		Properties properties = new Properties();
		InputStream inputStream = null;
		try {
			inputStream = new FileInputStream(fileName);
			properties.load(new InputStreamReader(inputStream, "UTF-8"));
		} catch (IOException e) {
			LOG.debug("load IOException:" + e.getMessage());
		} finally {
			if (inputStream != null) {
				try {
					inputStream.close(); // 关闭流
				} catch (IOException e) {
					LOG.debug("inputStream close IOException:" + e.getMessage());
				}
			}
		}
		
		props.putAll(properties);
	}

	public static Properties loadProperties(String fileName) {
		Properties properties = new Properties();
		InputStream inputStream = null;
		try {
			inputStream = new FileInputStream(fileName);
			properties.load(inputStream);
			return properties;
		} catch (IOException e) {
			LOG.debug("loadProperties IOException:" + e.getMessage());
		} finally {
			if (inputStream != null) {
				try {
					inputStream.close(); // 关闭流
				} catch (IOException e) {
					LOG.debug("inputStream close IOException:" + e.getMessage());
				}
			}
		}
		return null;
	}
	
	public static PropertyResourceBundle loadPropertyResourceBundle(String fileName) {
		PropertyResourceBundle bundle;
		InputStream inputStream = null;
		try {
			inputStream = new FileInputStream(getPath() + "/" + fileName + ".properties");
			bundle = new PropertyResourceBundle(inputStream);
			return bundle;
		} catch (IOException e) {
			LOG.debug("PropertyResourceBundle IOException:" + e.getMessage());
		} finally {
			if (inputStream != null) {
				try {
					inputStream.close(); // 关闭流
				} catch (IOException e) {
					LOG.debug("inputStream close IOException:" + e.getMessage());
				}
			}
		}
		return null;
	}
}