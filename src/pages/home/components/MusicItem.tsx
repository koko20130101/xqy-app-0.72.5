import React from 'react';
import type { PropsWithChildren } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { MusicTagModel } from '@/models';

type MusicItemProps = PropsWithChildren<{
	itemData: MusicTagModel;
	style?: any;
	onClick?: (step: number) => void;
}>;

const MusicItem = (props: MusicItemProps) => {
	const { itemData, onClick } = props;
	return (
		<View style={{ ...styles.container, ...props.style }}>
			<Image
				style={styles.musicPic}
				source={{
					uri: itemData.backImageUrl1,
				}}></Image>
			<Text style={styles.title}>{itemData.tagName}</Text>
		</View>
	);
};
export default MusicItem;

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#fff',
		padding: 10,
		borderRadius: 20,
		width: 140,
	},
	musicPic: {
		width: '100%',
		height: 105,
		borderRadius: 20,
	},
	title: {
		fontSize: 14,
		fontWeight: 'bold',
		color: '#000',
		marginTop: 8,
	},
	subTitle: {
		fontSize: 12,
		color: '#7D7C81',
		marginTop: 2,
	},
});
