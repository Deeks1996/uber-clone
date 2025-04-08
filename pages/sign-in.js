import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (<div className="bg-landing">
    <div className=" bg-black right-10 absolute top-10">

      <SignIn routing="hash"/>
    </div>
  </div>)
}