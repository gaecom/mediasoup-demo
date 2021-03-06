import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as appPropTypes from './appPropTypes';
import { withRoomContext } from '../RoomContext';
import PeerView from './PeerView';

const Peer = (props) =>
{
	const {
		roomClient,
		peer,
		audioConsumer,
		videoConsumer,
		audioMuted,
		faceDetection
	} = props;

	const audioEnabled = (
		Boolean(audioConsumer) &&
		!audioConsumer.locallyPaused &&
		!audioConsumer.remotelyPaused
	);

	const videoVisible = (
		Boolean(videoConsumer) &&
		!videoConsumer.locallyPaused &&
		!videoConsumer.remotelyPaused
	);

	return (
		<div data-component='Peer'>
			<div className='indicators'>
				<If condition={!audioEnabled}>
					<div className='icon mic-off' />
				</If>

				<If condition={!videoConsumer}>
					<div className='icon webcam-off' />
				</If>
			</div>

			<PeerView
				peer={peer}
				audioConsumerId={audioConsumer ? audioConsumer.id : null}
				videoConsumerId={videoConsumer ? videoConsumer.id : null}
				audioTrack={audioConsumer ? audioConsumer.track : null}
				videoTrack={videoConsumer ? videoConsumer.track : null}
				audioMuted={audioMuted}
				videoVisible={videoVisible}
				videoMultiLayer={videoConsumer && videoConsumer.type !== 'simple'}
				videoCurrentSpatialLayer={videoConsumer ? videoConsumer.currentSpatialLayer : null}
				videoPreferredSpatialLayer={
					videoConsumer
						? typeof videoConsumer.preferredSpatialLayer === 'number'
							? videoConsumer.preferredSpatialLayer
							: 2 // NOTE: We know that the preferred spatil layer is 2 because we are cool.
						: null
				}
				audioCodec={audioConsumer ? audioConsumer.codec : null}
				videoCodec={videoConsumer ? videoConsumer.codec : null}
				audioScore={audioConsumer ? audioConsumer.score : null}
				videoScore={videoConsumer ? videoConsumer.score : null}
				faceDetection={faceDetection}
				onChangeVideoPreferredSpatialLayer={(spatialLayer) =>
				{
					roomClient.setConsumerPreferredSpatialLayer(videoConsumer.id, spatialLayer);
				}}
				onRequestKeyFrame={() =>
				{
					roomClient.requestConsumerKeyFrame(videoConsumer.id);
				}}
			/>
		</div>
	);
};

Peer.propTypes =
{
	roomClient    : PropTypes.any.isRequired,
	peer          : appPropTypes.Peer.isRequired,
	audioConsumer : appPropTypes.Consumer,
	videoConsumer : appPropTypes.Consumer,
	audioMuted    : PropTypes.bool,
	faceDetection : PropTypes.bool.isRequired
};

const mapStateToProps = (state, { id }) =>
{
	const me = state.me;
	const peer = state.peers[id];
	const consumersArray = peer.consumers
		.map((consumerId) => state.consumers[consumerId]);
	const audioConsumer =
		consumersArray.find((consumer) => consumer.track.kind === 'audio');
	const videoConsumer =
		consumersArray.find((consumer) => consumer.track.kind === 'video');

	return {
		peer,
		audioConsumer,
		videoConsumer,
		audioMuted    : me.audioMuted,
		faceDetection : state.room.faceDetection
	};
};

const PeerContainer = withRoomContext(connect(
	mapStateToProps,
	undefined
)(Peer));

export default PeerContainer;
