/**
 * 样式定义
 */
var COLOR_THEME = {
	'black':{
		textColor : {
			'1' : 'rgba(255,255,255,1)',
			'2' : 'rgba(255,255,255,0.8)',
			'3' : 'rgba(255,255,255,0.5)',
			'4' : 'rgba(255,255,255,0.25)' 
		},
		bgColor : {
			'1' : '#2d2d2d',
			'2' : '#3d3d3d',
			'3' : '#4d4d4d',
			'page': '#1d1d1d',
			'input': '#222222'
		}
	},
	'light':{
		textColor : {
			'1' : 'rgba(0,0,0,1)',
			'2' : 'rgba(0,0,0,0.7)',
			'3' : 'rgba(0,0,0,0.5)',
			'4' : 'rgba(0,0,0,0.25)' 
		},
		bgColor : {
			'1' : '#FFFFFF',
			'2' : '#EAEAEA',
			'3' : '#DADADA',
			'page': '#F4F7FA',
			'input': '#FFFFFF'
		}
	}
};

var TEXT_COLOR_LEVEL = COLOR_THEME[SELECTED_THEME].textColor;
var BG_COLOR_LEVEL = COLOR_THEME[SELECTED_THEME].bgColor;