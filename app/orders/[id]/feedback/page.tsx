import GiveFeedbackClient from "./GiveFeedbackClient"

export default async function Page({params}: {params: Promise<{ id: string }>}) {
    const { id } = await params;
    return <GiveFeedbackClient id={id} />
}
