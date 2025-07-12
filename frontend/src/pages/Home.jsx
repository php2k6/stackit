
import React from 'react'
import PostCard from '../components/PostCard'


export default function Home() {
    // const [cards, setcards] = useState()
    var names = ["hello", "hi", "nice", "hello", "hi", "nice"]
    return (
        <>
            <section className="container ">
                <h1 className='text-3xl font-bold text-center my-3'>Our Services</h1>

            </section>
            <section>
                <h2 className='text-2xl font-bold my-2'>Latest Questions</h2>
                <PostCard
                    title="How to use useEffect with async function in React?"
                    tags={["react", "hooks", "javascript"]}
                    desc="I'm trying to fetch data inside useEffect but getting unexpected behavior. How should I handle async calls?"
                    totalAns={5}
                />
            </section>

        </>
    )
}
