package com.lxk.utils.extend;

import com.lxk.utils.LoadProperties;
import org.apache.log4j.xml.DOMConfigurator;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.config.PropertyPlaceholderConfigurer;
import org.springframework.util.PropertyPlaceholderHelper;
import org.springframework.util.PropertyPlaceholderHelper.PlaceholderResolver;
import org.springframework.util.StringValueResolver;

import java.util.Properties;

/**
 * 用于读取外部资源配置文件
 * 改动的地方：注释context:property-placeholder标签，因为spring的context:property-placeholder标签是PropertyPlaceholderConfigurer类
 * 创建类以继承PropertyPlaceholderConfigurer类，
 * 重写方法调用classpath的配置文件
 *
 */
public class ExtendPropertyPlaceholderConfigurer extends PropertyPlaceholderConfigurer {

	/**
	 * context标签时调用
	*/
	@Override
	protected void processProperties(ConfigurableListableBeanFactory beanFactoryToProcess, Properties props) throws BeansException {
		String path = LoadProperties.getPath();
		DOMConfigurator.configure(path + "/log4j.xml");
		
		LoadProperties.load(path + "/mongo.properties", props);
		LoadProperties.load(path + "/default_setting.properties", props);

		super.processProperties(beanFactoryToProcess, props);
		StringValueResolver valueResolver = new PlaceholderResolvingStringValueResolver(props);

		this.doProcessProperties(beanFactoryToProcess, valueResolver);
	}
	
	private class PlaceholderResolvingStringValueResolver implements StringValueResolver {

		private final PropertyPlaceholderHelper helper;

		private final PlaceholderResolver resolver;

		PlaceholderResolvingStringValueResolver(Properties props) {
			this.helper = new PropertyPlaceholderHelper(
					placeholderPrefix, placeholderSuffix, valueSeparator, ignoreUnresolvablePlaceholders);
			this.resolver = new PropertyPlaceholderConfigurerResolver(props);
		}

		public String resolveStringValue(String strVal) throws BeansException {
			String value = this.helper.replacePlaceholders(strVal, this.resolver);
			return (value.equals(nullValue) ? null : value);
		}
	}


	private class PropertyPlaceholderConfigurerResolver implements PlaceholderResolver {

		private final Properties props;

		private PropertyPlaceholderConfigurerResolver(Properties props) {
			this.props = props;
		}

		public String resolvePlaceholder(String placeholderName) {
			return ExtendPropertyPlaceholderConfigurer.this.resolvePlaceholder(placeholderName, props, SYSTEM_PROPERTIES_MODE_FALLBACK);
		}
	}
}