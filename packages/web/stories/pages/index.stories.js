import Feed from '../../pages/feed'

function Story() {
  return <Feed />
}

// Here we export a variant of the default template passing props
export const LoginStory = Story.bind({})

// Here we export the default component that
// will be used by Storybook to show it inside the sidebar
const defaultComponent = {
  title: 'Feed',
  component: Feed,
}

export default defaultComponent
