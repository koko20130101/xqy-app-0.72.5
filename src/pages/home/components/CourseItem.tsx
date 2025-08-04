import React from 'react';
import type { PropsWithChildren } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';

type CourseItemProps = PropsWithChildren<{
	itemData: any;
	style?: any;
	onClick?: (step: number) => void;
}>;

const CourseItem = (props: CourseItemProps) => {
	const { itemData, onClick } = props;
	return (
		<View style={{ ...styles.container, ...props.style }}>
			<Image
				style={styles.musicPic}
				source={{
					uri: itemData.url,
				}}></Image>
			<View style={{ flex: 1, marginLeft: 10 }}>
				<Text style={styles.title} numberOfLines={1}>
					{itemData.name}
				</Text>
				<Text style={{ ...styles.subTitle, flex: 1 }} numberOfLines={2}>
					{itemData.introduce}
				</Text>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
					<Text style={{ ...styles.subTitle, color: '#ff6778', lineHeight: 20 }}>
						{itemData.price ? '￥' + ((itemData.price || 0) / 100).toFixed(2) + '元' : '免费'}
					</Text>
					<Text style={styles.tips}>{itemData.studyCount}人在学</Text>
				</View>
			</View>
		</View>
	);
};
export default CourseItem;

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#fff',
		padding: 10,
		borderRadius: 20,
		flexDirection: 'row',
	},
	musicPic: {
		width: 145,
		height: 82,
		borderRadius: 10,
	},
	title: {
		fontSize: 14,
		fontWeight: 'bold',
		color: '#000',
	},
	subTitle: {
		fontSize: 12,
		color: '#7D7C81',
		marginTop: 2,
	},
	tips: {
		height: 18,
		lineHeight: 18,
		fontSize: 10,
		backgroundColor: '#def4ef',
		color: '#4fae97',
		paddingHorizontal: 8,
		borderRadius: 10,
	},
});
