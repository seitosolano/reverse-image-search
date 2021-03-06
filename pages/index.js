import Head from 'next/head'
import Link from 'next/link'
import Date from '../components/date'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import { getSortedPostsData } from '../lib/posts'
import { ProgressBarLine } from 'react-progressbar-line'
import { useState } from 'react'
import Router, { useRouter } from 'next/router'
import {TEST_IMAGE_URL, IS_TEST_ON_LOCAL} from '../constant'


export async function getStaticProps() {
  const allPostsData = getSortedPostsData()
  return {
    props: {
      allPostsData
    }
  }
}

export default function Home({ allPostsData }) {
  
  const PROGRESS_STATE = [
    {label: 'Uploading your NFT...', value: 30},
    {label: 'Loading Safeguard Algorithm', value: 60},
    {label: 'Doing a Background Check', value: 100}
  ];

  const router = useRouter();

  const [image, setImage] = useState(null);
  const [createObjectURL, setCreateObjectURL] = useState(null);
  const [progressState, setProgrssState] = useState(false);
  const [progressMessage, setProgrssMessage] = useState('Safeguard');
  const [progressValue, setProgressValue] = useState(0);

  const uploadToClient = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];

      setImage(i);

      if( IS_TEST_ON_LOCAL ) setCreateObjectURL(TEST_IMAGE_URL);
      else setCreateObjectURL(URL.createObjectURL(i));
    }
  }

  const uploadToServer = async (event) => {

    // - 1. show the prgress bar 
    setProgrssState(true)
    setProgressValue(0);

    //- 2. position the progress bar for uploading the NFT.
    setProgrssMessage(PROGRESS_STATE[0].label)
    setProgressValue(PROGRESS_STATE[0].value)
    const body = new FormData();
    body.append("file", image);    
    let response = await fetch("/api/upload", {
      method: "POST",
      body
    });
    
    // let uri = await response.json().files.file.originalFilename;
    let uri = await response.json();
    uri = `${window.location.href}upload/${uri.files.file.originalFilename}`;
    
    if( IS_TEST_ON_LOCAL )  uri = TEST_IMAGE_URL;
    await new Promise(resolve => setTimeout(resolve, 2000));

    //-3. position the progress bar for loading safeguard algorithm
    setProgrssMessage(PROGRESS_STATE[1].label)
    setProgressValue(PROGRESS_STATE[1].value)
    await new Promise(resolve => setTimeout(resolve, 2000))

    //-4. position the progress bar for doing a background check
    setProgrssMessage(PROGRESS_STATE[2].label)
    response = await fetch("/api/search", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uri: uri })
    })
    setProgressValue(PROGRESS_STATE[2].value)
    const pages = (await response.json()).results;
    console.log(pages);

    pages.length > 0 ? 
      Router.push({
        pathname: 'posts/oop',
        query: { data: JSON.stringify(pages)}} )  :
      Router.push({
          pathname: 'posts/success'})
  };

  return (
    <Layout home >
  
      <Head>
        <title>{siteTitle}</title>
      </Head>

      {/* title */}
      <section className={utilStyles.headingMd}>
        <p>{progressMessage}</p>
      </section> {/* //-title */}
      
      <section className={utilStyles.imageSection}>
        {/* <h4>Select Image</h4> */}
        <div className={utilStyles.uploadBtnDiv}>
          <label class={utilStyles.chooseFileBtn}>
            <input type="file" name="myImage" onChange={uploadToClient} />
            Choose File
          </label>
        </div>
      
       <div className={utilStyles.sendBtnDiv}>
            <button
              className={utilStyles.risBtn}
              type="submit"
              onClick={uploadToServer}
            >
            Send to server
          </button>
       </div>
        
        
      </section>

      <section>
      <img src={createObjectURL} />
      </section>
       
      {/* progressbar */}
      <div style={{display: progressState == true ? 'block' : 'none'}}>
        <ProgressBarLine
          value={progressValue}          
          min={0}
          max={100}
          strokeWidth={1}
          trailWidth={1}
          styles={{
            path: {
              stroke: '#a7ff83'
            },
            trail: {
              stroke: '#17b978'
            },
            text: {
              fill: '#ffffff00',
              textAlign: 'center',
              fontSize: '32px',
            }
          }}
        />
      </div>  {/* //-progressbar */}
    </Layout>
  )
}
