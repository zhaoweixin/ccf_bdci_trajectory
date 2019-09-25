<template>
    <div id="control">
        <ButtonGroup vertical>
            {{ author }}
            <Button type="default" ghost>Original</Button>
            <Button type="default" ghost>Destination</Button>
        </ButtonGroup>
    </div>

</template>

<script>

    export default {
        name: "AppControl",
        data(){
            return {

            }
        },
        computed:{
            author () {
                return this.$store.state.author
            }
        }
    }
</script>

<style scoped>

    #control{
        position: relative;
        float: left;
        width: 25%;
        height: 65%;
    }
</style>
