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
				style={styles.pic}
				source={{
					uri: itemData.url,
				}}></Image>
			<View style={styles.bottomInfo}>
				<Image source={require('@images/home/icon-arrow-right.png')} style={styles.infoIcon} resizeMode="center" />
				<Text style={styles.infoText}>251</Text>
				<Image source={require('@images/home/icon-arrow-right.png')} style={styles.infoIcon} resizeMode="center" />
				<Text style={styles.infoText}>251</Text>
				<Image source={require('@images/home/icon-arrow-right.png')} style={styles.infoIcon} resizeMode="center" />
				<Text style={styles.infoText}>251</Text>
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
		width: 200,
	},
	pic: {
		height: 82,
		borderRadius: 10,
	},
	bottomInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingTop: 10,
		paddingHorizontal: 4
	},
	infoIcon: {
		width: 13,
		height: 13,
		marginRight: 6
	},
	infoText: {
		fontSize: 12,
		color: '#475569',
		marginRight: 18
	},
});
