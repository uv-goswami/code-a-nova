import { isPptLink, isVideoLink } from '../../src/utils/linkValidator';

describe('linkValidator', () => {
  test.each([
    'https://drive.google.com/file/d/x/view',
    'https://docs.google.com/presentation/d/x',
    'https://1drv.ms/p/abc',
    'https://contoso.sharepoint.com/x',
  ])('accepts PPT link %s', (url) => expect(isPptLink(url)).toBe(true));

  test.each(['https://evil.com/drive.google.com', 'https://notdrive.google.com.evil.io/x', 'not a url'])(
    'rejects PPT link %s',
    (url) => expect(isPptLink(url)).toBe(false)
  );

  test('video links', () => {
    expect(isVideoLink('https://www.youtube.com/watch?v=1')).toBe(true);
    expect(isVideoLink('https://youtu.be/1')).toBe(true);
    expect(isVideoLink('https://vimeo.com/1')).toBe(false);
  });
});
