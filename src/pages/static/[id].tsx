import fs from 'fs';
import matter from 'gray-matter';
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import Head from 'next/head';
import path from 'path';
import * as React from 'react';

const contentDirectory = path.join(process.cwd(), 'src/contents');

const getAllPostSlugs = () => {
  const fileNames = fs.readdirSync(contentDirectory);

  return fileNames.map(filename => {
    return {
      params: {
        id: filename.replace('.mdx', '')
      }
    };
  });
};

interface StaticProps {
  source: MDXRemoteSerializeResult;
  frontMatter: { [key: string]: any };
}

const components = {
  h1: props => <h1 {...props} />,
  h2: props => <h2 {...props} />,
  h3: props => <h3 {...props} />,
  h4: props => <h4 {...props} />,
  p: props => <p {...props} />,
  a: props => <a {...props} />,
  li: props => <li {...props} />
};

const Static: NextPage<StaticProps> = ({ source, frontMatter }) => {
  return (
    <div>
      <Head>
        <title>{frontMatter.title}</title>
      </Head>
      <div>
        <MDXRemote {...source} components={components} />
      </div>
    </div>
  );
};

// 静的ページとして取得するパスを指定
export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllPostSlugs();
  return {
    paths,
    fallback: false // 見つからない場合は404とする
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const fullPath = path.join(contentDirectory, `${params.id}.mdx`);
  const pageContent = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(pageContent);
  const mdxSource = await serialize(content);
  return {
    props: {
      source: mdxSource,
      frontMatter: data
    },
    revalidate: 600 // sec
  };
};

export default Static;
