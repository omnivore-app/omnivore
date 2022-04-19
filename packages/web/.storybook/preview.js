import { RouterContext } from 'next/dist/shared/lib/router-context';
import * as NextImage from 'next/image';
import { getCssText } from '../components/tokens/stitches.config';
import "../styles/globals.css";

const OriginalNextImage = NextImage.default;

Object.defineProperty(NextImage, 'default', {
  configurable: true,
  value: props => <OriginalNextImage {...props} unoptimized />
})

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  nextRouter: {
    Provider: RouterContext.Provider
  }
}

export const decorators = [
  (Story, context) => {
    return (
      <>
        <style
          id="stitches"
          dangerouslySetInnerHTML={{
            __html: getCssText(),
          }}
        />
        <div className='Gray'>
          <Story {...context} />
        </div>
      </>
    );
  }
]
