import { render } from '@testing-library/vue'
import NavBar from '../components/NavBar.vue'

//TODO Replace with real tests
test('it should work', () => {
  const { getByText } = render(NavBar, {
    props: {}
  })

  // assert output
  getByText('Wani Kani Plus+')
})