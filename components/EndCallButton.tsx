'use client'
import React from 'react';
import {useCall, useCallStateHooks} from "@stream-io/video-react-sdk";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";

const EndCallButton = () => {
	const call = useCall()
	const router = useRouter()
	// доступ к вызову
	const { useLocalParticipant } = useCallStateHooks()
	// досутп к местному участнику
	const localParticipant = useLocalParticipant()
	// совпадает ли id владельца с id собрания текущего участника
	const isMeetingOwner = localParticipant && call?.state.createdBy && localParticipant.userId === call.state.createdBy.id

	if(!isMeetingOwner) return null

	return (
		<Button onClick={async () => {
			await call.endCall()
			router.push('/')
		}} className='bg-red-500'
		>
			Завершить звонок для всех
		</Button>
	);
};

export default EndCallButton;
