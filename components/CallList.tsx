'use client'
import React, {useEffect, useState} from 'react';
import {useGetCalls} from "@/hooks/useGetCalls";
import {useRouter} from "next/navigation";
import {CallRecording} from "@stream-io/video-client";
import meetingModal from "@/components/MeetingModal";
import {Call} from "@stream-io/video-react-sdk";
import MeetingCard from './MeetingCard';
import Loader from "@/components/Loader";
import {toast, useToast} from "@/components/ui/use-toast";

const CallList = ({ type }: { type: 'ended' | 'upcoming' | 'recordings' }) => {
	const { endedCalls, upcomingCalls, callRecordings, isLoading } = useGetCalls()
	const [ recordings, setRecordings ] = useState<CallRecording[]>([])
	const router = useRouter()
	const { toast } = useToast()

	const getCalls = () => {
		switch (type){
			case 'ended':
				return endedCalls
			case 'recordings':
				return recordings
			case 'upcoming':
				return upcomingCalls
			default:
				return []
		}
	}

	const getNoCallsMessage = () => {
		switch (type){
			case 'ended':
				return 'Нет завершенных звонков'
			case 'recordings':
				return 'Нет записей'
			case 'upcoming':
				return 'Нет предстоящих встреч'
			default:
				return ''
		}
	}

	useEffect(() => {
		const fetchRecordings = async () => {
			try {
				const callData = await Promise.all(callRecordings.map((meeting) => meeting.queryRecordings()))

				const recordings = callData
					.filter(call => call.recordings.length > 0)
					.flatMap(call => call.recordings)

				setRecordings(recordings)
			} catch (error){
					toast({title: 'Попробуйте позже' })
			}
		}

		if(type === 'recordings') fetchRecordings()
	}, [type, callRecordings]);

	const calls = getCalls()
	const noCallMessage = getNoCallsMessage()

	if(isLoading) return <Loader />

	return (
		<div className='grid grid-cols-1 gap-5 xl:grid-cols-2'>
			{calls && calls.length > 0 ? calls.map((meeting: Call | CallRecording) => (
				<MeetingCard
					key={(meeting as Call).id}
					icon={
						type === 'ended' ?
							'/icons/previous.svg' :
							 type === 'upcoming' ?
								 '/icons/upcoming.svg' :
								 '/icons/recordings.svg'
					}
					title={(meeting as Call).state?.custom?.description?.substring(0, 26) ||
						(meeting as CallRecording).filename?.substring(0, 20) ||
						'Личная встреча'
					}
					date={
						(meeting as Call).state?.startsAt?.toLocaleString() ||
						(meeting as CallRecording).start_time?.toLocaleString()
					}
					isPreviousMeeting={type === 'ended'}
					link={
						type === 'recordings' ?
							(meeting as CallRecording).url :
							`${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${(meeting as Call).id}`
					}
					buttonIcon1={type === 'recordings' ? '/icons/play.svg' : undefined}
					buttonText={type === 'recordings' ? 'Воспроизвести' : 'Начать'}
					handleClick={
						type === 'recordings' ?
							() => router.push(`${(meeting as CallRecording).url}`) :
							() => router.push(`/meeting/${(meeting as Call).id}`)
					}
				/>
			)) : (
				<h1 className='text-2xl font-bold text-white'>{noCallMessage}</h1>
			)}
		</div>
	);
};

export default CallList;
